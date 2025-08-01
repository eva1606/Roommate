const db = require('../db');

exports.getProfileById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await db.query(`
      SELECT u.first_name, u.last_name, u.email, u.photo_url, p.*
      FROM users u
      JOIN profil_users p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur getProfileById :', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.updateProfileById = async (req, res) => {
  const userId = req.params.id;
  const {
    first_name, last_name, email,
    gender, looking_for, profession, age,
    smoke, pets, budget, location 
  } = req.body;

  const photo_url = req.file?.path || null;

  try {
    await db.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4`,
      [first_name, last_name, email, userId]
    );

    let query = `
      UPDATE profil_users
      SET gender = $1, looking_for = $2, profession = $3, age = $4,
          smoke = $5, pets = $6, budget = $7, location = $8
          ${photo_url ? ', photo_url = $9' : ''}
      WHERE user_id = ${photo_url ? '$10' : '$9'}
    `;

    const params = [
      gender, looking_for, profession, age,
      smoke, pets, budget, location
    ];

    if (photo_url) {
      params.push(photo_url); 
      params.push(userId);   
    } else {
      params.push(userId);    
    }

    await db.query(query, params);

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur updateProfileById :', err);
    res.status(500).json({ error: 'Server error while updating.' });
  }
};
