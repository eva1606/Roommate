const db = require('../db'); // ✅ Garde db si c'est ce que tu utilises partout ailleurs

exports.getFilteredApartments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query( // 👈 ici tu gardes db pour rester cohérent
      `
      SELECT p.*
      FROM properties p
      JOIN profil_users pu ON pu.user_id = $1
      WHERE p.status = 'available'
        AND p.price BETWEEN (pu.budget - 1000) AND (pu.budget + 1000)
        AND LOWER(p.address) LIKE '%' || LOWER(pu.location) || '%'
      `,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur lors du filtrage des propriétés :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
