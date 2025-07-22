const pool = require('../db');

// 🔍 Rechercher des roommates avec un budget et une localisation similaires
const getPotentialRoommates = async (req, res) => {
  const userId = req.params.id;

  try {
    // 1. Récupère d'abord le profil de l'utilisateur connecté
    const userResult = await pool.query(
      'SELECT budget, location FROM profil_users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profil utilisateur introuvable.' });
    }

    const { budget, location } = userResult.rows[0];

    // 2. Rechercher des profils proches (±1000 shekels) et même localisation, sauf soi-même
    const roommatesResult = await pool.query(
      `SELECT user_id, first_name, last_name, location, budget, photo_url
       FROM profil_users
       WHERE user_id != $1
         AND ABS(budget - $2) <= 1000
         AND location = $3
         LIMIT 20`,
      [userId, budget, location]
    );

    res.json(roommatesResult.rows);
  } catch (err) {
    console.error('❌ Erreur potential roommates:', err.message);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
  }
};

module.exports = { getPotentialRoommates };
