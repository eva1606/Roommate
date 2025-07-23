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
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateProfileById = async (req, res) => {
  const userId = req.params.id;

  const {
    first_name, last_name, email,
    gender, looking_for, profession, age,
    smoke, pets, budget
  } = req.body;

  const photo_url = req.file?.path || null;

  try {
    // ✅ Mise à jour des infos générales
    if (photo_url) {
      await db.query(
        `UPDATE users SET first_name=$1, last_name=$2, email=$3, photo_url=$4 WHERE id=$5`,
        [first_name, last_name, email, photo_url, userId]
      );
    } else {
      await db.query(
        `UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4`,
        [first_name, last_name, email, userId]
      );
    }

    // ✅ Mise à jour du profil utilisateur
    await db.query(
      `UPDATE profil_users
       SET gender=$1, looking_for=$2, profession=$3, age=$4,
           smoke=$5, pets=$6, budget=$7
       WHERE user_id=$8`,
      [gender, looking_for, profession, age, smoke, pets, budget, userId]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur update profil :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
};
