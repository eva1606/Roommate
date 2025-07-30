const db = require('../db'); 

exports.getFilteredApartments = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      `
      SELECT p.*,
  EXISTS (
    SELECT 1 FROM favorite_apartments f
    WHERE f.user_id = $1 AND f.property_id = p.id
  ) AS is_favorited
FROM properties p
JOIN available_apartment a ON a.property_id = p.id
JOIN profil_users pu ON pu.user_id = $1
WHERE p.status = 'available'
  AND p.price BETWEEN (pu.budget - 1000) AND (pu.budget + 1000)
  AND LOWER(p.address) LIKE '%' || LOWER(pu.location) || '%'
  AND NOT EXISTS (
    SELECT 1 FROM hidden_apartments h
    WHERE h.user_id = $1 AND h.property_id = p.id
  )
ORDER BY p.created_at DESC;

      `,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('❌ Error while filtering properties:', err);
    res.status(500).json({ error: 'Server error.'})
  }
};
exports.addToFavorites = async (req, res) => {
  const { user_id, property_id } = req.body;

  try {
   
    const existing = await db.query(
      'SELECT * FROM favorite_apartments WHERE user_id = $1 AND property_id = $2',
      [user_id, property_id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Already in favorites.' });
    }

    
    await db.query(
      'INSERT INTO favorite_apartments (user_id, property_id) VALUES ($1, $2)',
      [user_id, property_id]
    );

    res.status(201).json({ message: 'Added to favorites.' });
  } catch (err) {
    console.error("❌ Error adding to favorites:", err);
    res.status(500).json({ error: 'Server error.' });
  }
};
exports.getFavoriteApartments = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT p.*
      FROM favorite_apartments f
      JOIN properties p ON p.id = f.property_id
      WHERE f.user_id = $1
      ORDER BY f.id DESC
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error retrieving favorites:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.removeFromFavorites = async (req, res) => {
  const { user_id, property_id } = req.body;

  try {
    await db.query(
      'DELETE FROM favorite_apartments WHERE user_id = $1 AND property_id = $2',
      [user_id, property_id]
    );

    res.status(200).json({ message: 'Removed from favorites.' });
  } catch (err) {
    console.error("❌ Error removing favorite:", err);
    res.status(500).json({ error: 'Server error.' });
  }
};
exports.hideApartment = async (req, res) => {
  const { user_id, property_id } = req.body;

  try {
    await db.query(
      'INSERT INTO hidden_apartments (user_id, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, property_id]
    );
    res.status(201).json({ message: "Apartment hidden" });
  } catch (err) {
    console.error("❌ Error in hideApartment:", err);
    res.status(500).json({ error: "Server errorr" });
  }
};
