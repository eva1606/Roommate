const pool = require('../db');

exports.getRoommatePropertyAndColocs = async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Trouver la propriété louée
    const propRes = await pool.query(
      `SELECT p.*
       FROM roomate_properties rp
       JOIN properties p ON rp.property_id = p.id
       WHERE rp.user_id = $1`,
      [userId]
    );

    const property = propRes.rows[0];

    if (!property) {
      return res.json({ property: null, roommates: [] });
    }

    // 2. Trouver les autres colocataires de cette propriété
    const colocRes = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.photo_url
       FROM roomate_properties rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.property_id = $1 AND rp.user_id != $2`,
      [property.id, userId]
    );

    res.json({
      property,
      roommates: colocRes.rows
    });

  } catch (err) {
    console.error("❌ Erreur récupération propriété/colocs :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
