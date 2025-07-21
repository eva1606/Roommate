const pool = require('../db'); // Connexion à ta base PostgreSQL

// Récupère un profil utilisateur par user_id
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

module.exports = { getUserProfile };
