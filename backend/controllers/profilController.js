const pool = require('../db'); // Connexion à ta base PostgreSQL

// ✅ Récupérer le profil par user_id
const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT * FROM profil_users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profil non trouvé.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur récupération profil:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

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
    budget
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE profil_users SET
        first_name = $1,
        last_name = $2,
        email = $3,
        gender = $4,
        looking_for = $5,
        profession = $6,
        age = $7,
        smoke = $8,
        pets = $9,
        budget = $10
      WHERE user_id = $11
      RETURNING *`,
      [first_name, last_name, email, gender, looking_for, profession, age, smoke, pets, budget, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur mise à jour profil:', err.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

module.exports = { getUserProfile, updateUserProfile };
