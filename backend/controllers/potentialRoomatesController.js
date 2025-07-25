const db = require("../db");

exports.getPotentialRoommates = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT budget, location FROM profil_users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profil utilisateur introuvable." });
    }

    const { budget, location } = result.rows[0];

    const roommates = await db.query(
      `SELECT first_name, last_name, budget, photo_url, location
       FROM profil_users
       WHERE user_id != $1
         AND budget BETWEEN $2 - 1000 AND $2 + 1000
         AND LOWER(location) LIKE '%' || LOWER($3) || '%'`,
      [userId, budget, location]
    );

    res.json(roommates.rows);
  } catch (err) {
    console.error("❌ Erreur récupération roommates :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
