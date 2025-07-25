const db = require('../config/db');

exports.getPotentialRoommates = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Récupère les infos du user connecté
    const userProfile = await db.query(
      `SELECT location, budget FROM profil_users WHERE user_id = $1`,
      [userId]
    );

    if (userProfile.rows.length === 0) {
      return res.status(404).json({ error: "Profil introuvable." });
    }

    const { location, budget } = userProfile.rows[0];
    const numericBudget = Number(budget);

    // Récupère les profils compatibles
    const result = await db.query(
      `SELECT first_name, last_name, location, budget, photo_url
       FROM profil_users
       WHERE user_id != $1
         AND location ILIKE '%' || $2 || '%'
         AND budget BETWEEN $3 AND $4`,
      [userId, location, numericBudget - 1000, numericBudget + 1000]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération roommates :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
