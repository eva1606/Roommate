const pool = require('../db');
const cloudinary = require('cloudinary').v2;

const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const {
    first_name,
    last_name,
    email,
    gender,
    looking_for,
    profession,
    age,
    smoke,
    pets,
    budget,
    location
  } = req.body;

  try {
    let photo_url = null;

    // Si une nouvelle photo est uploadée, on la récupère depuis Cloudinary
    if (req.file) {
      photo_url = req.file.path;
    }

    // Mise à jour du profil
    const result = await pool.query(
      `UPDATE profil_users
       SET first_name = $1,
           last_name = $2,
           email = $3,
           gender = $4,
           looking_for = $5,
           profession = $6,
           age = $7,
           smoke = $8,
           pets = $9,
           budget = $10,
           location = $11,
           photo_url = COALESCE($12, photo_url)
       WHERE user_id = $13
       RETURNING *`,
      [
        first_name,
        last_name,
        email,
        gender,
        looking_for,
        profession,
        age,
        smoke === 'true' || smoke === true,
        pets === 'true' || pets === true,
        budget,
        location,
        photo_url,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profil non trouvé.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur mise à jour profil:', err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil.' });
  }
};

module.exports = { updateUserProfile };
