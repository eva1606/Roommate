const pool = require('../db');

// controllers/favoritesController.js
exports.getUserFavorites = async (req, res) => {
    const userId = req.params.userId;
    try {
      const result = await db.query(`
        SELECT p.*
        FROM favorite_apartments fa
        JOIN properties p ON fa.property_id = p.id
        WHERE fa.user_id = $1
      `, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('❌ Erreur récupération favoris :', error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  