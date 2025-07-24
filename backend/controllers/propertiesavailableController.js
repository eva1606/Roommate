const db = require('../db');

// ✅ 1. Obtenir les propriétés filtrées pour un utilisateur
exports.getFilteredApartments = async (req, res) => {
  const userId = req.params.userId;

  try {
    // On récupère les préférences de l'utilisateur
    const user = await db.query(
      'SELECT budget, location FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { budget, location } = user.rows[0];
    const minBudget = budget - 1000;
    const maxBudget = budget + 1000;

    // On récupère les propriétés disponibles + si elles sont déjà en favoris
    const propertiesResult = await db.query(
      `
      SELECT p.*,
        EXISTS (
          SELECT 1 FROM favorite_apartments f
          WHERE f.user_id = $4 AND f.property_id = p.id
        ) AS is_favorited
      FROM properties p
      WHERE p.status = 'available'
        AND p.price BETWEEN $1 AND $2
        AND LOWER(p.address) LIKE '%' || LOWER($3) || '%'
      ORDER BY p.created_at DESC
      `,
      [minBudget, maxBudget, location, userId]
    );

    return res.json(propertiesResult.rows);
  } catch (err) {
    console.error('❌ Erreur lors du filtrage des propriétés:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ✅ 2. Ajouter une propriété aux favoris
exports.addToFavorites = async (req, res) => {
  const { user_id, property_id } = req.body;

  if (!user_id || !property_id) {
    return res.status(400).json({ error: 'user_id et property_id requis' });
  }

  try {
    await db.query(
      `
      INSERT INTO favorite_apartments (user_id, property_id)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1 FROM favorite_apartments
        WHERE user_id = $1 AND property_id = $2
      )
      `,
      [user_id, property_id]
    );

    res.status(200).json({ message: 'Ajouté aux favoris.' });
  } catch (err) {
    console.error('❌ Erreur ajout favori :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ✅ 3. Supprimer une propriété de la table available_apartment
exports.removeAvailableApartment = async (req, res) => {
  const { user_id, property_id } = req.body;

  if (!user_id || !property_id) {
    return res.status(400).json({ error: 'user_id et property_id requis' });
  }

  try {
    await db.query(
      `
      DELETE FROM available_apartment
      WHERE user_id = $1 AND property_id = $2
      `,
      [user_id, property_id]
    );

    res.status(200).json({ message: 'Appartement retiré des disponibles.' });
  } catch (err) {
    console.error('❌ Erreur suppression available_apartment :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
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
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération favoris :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
// ✅ 4. Sauvegarder des propriétés disponibles pour un utilisateur
exports.saveAvailableApartments = async (req, res) => {
  const userId = req.params.id;
  const { properties } = req.body;

  if (!userId || !Array.isArray(properties)) {
    return res.status(400).json({ error: "userId et tableau de propriétés requis" });
  }

  try {
    // On supprime les anciennes pour éviter les doublons
    await db.query(`DELETE FROM available_apartment WHERE user_id = $1`, [userId]);

    // On insère les nouvelles
    for (const propertyId of properties) {
      await db.query(
        `INSERT INTO available_apartment (user_id, property_id) VALUES ($1, $2)`,
        [userId, propertyId]
      );
    }

    res.status(200).json({ message: "Propriétés sauvegardées avec succès." });
  } catch (err) {
    console.error("❌ Erreur sauvegarde propriétés :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

