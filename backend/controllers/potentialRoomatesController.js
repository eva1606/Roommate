const db = require('../db');

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
      `SELECT id, first_name, last_name, location, budget, photo_url
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
exports.addFavoriteRoommate = async (req, res) => {
  const { userId, profilUserId } = req.body;

  try {
    await db.query(
      `INSERT INTO favorite_roommate (user_id, profil_user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, profilUserId]
    );
    res.status(200).json({ message: "Ajouté aux favoris" });
  } catch (err) {
    console.error("Erreur ajout favori :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.removeFavoriteRoommate = async (req, res) => {
  const { userId, profilUserId } = req.body;

  try {
    await db.query(
      `DELETE FROM favorite_roommate WHERE user_id = $1 AND profil_user_id = $2`,
      [userId, profilUserId]
    );
    res.status(200).json({ message: "Supprimé des favoris" });
  } catch (err) {
    console.error("Erreur suppression favori :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getUserFavoriteRoommates = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT profil_user_id FROM favorite_roommate WHERE user_id = $1`,
      [userId]
    );
    const favorites = result.rows.map(row => row.profil_user_id);
    res.json(favorites);
  } catch (err) {
    console.error("Erreur récupération favoris :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
