const pool = require('../db');

const getCompatibleRoommates = async (req, res) => {
  const userId = req.params.id;

  try {
    // 🔹 On récupère le profil de l'utilisateur actuel
    const currentUserResult = await pool.query(`
      SELECT budget, location
      FROM profil_users
      WHERE user_id = $1
    `, [userId]);

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: "Profil utilisateur introuvable." });
    }

    const { budget, location } = currentUserResult.rows[0];

    // 🔹 On calcule les marges de budget compatibles (+/- 20%)
    const minBudget = budget * 0.8;
    const maxBudget = budget * 1.2;

    // 🔹 On récupère les colocataires compatibles
    const result = await pool.query(`
      SELECT 
        p.user_id,
        u.first_name,
        u.last_name,
        p.budget,
        p.location,
        p.photo_url
      FROM profil_users p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.user_id != $1
        AND p.budget BETWEEN $2 AND $3
        AND p.location = $4
    `, [userId, minBudget, maxBudget, location]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur getCompatibleRoommates:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { getCompatibleRoommates };
