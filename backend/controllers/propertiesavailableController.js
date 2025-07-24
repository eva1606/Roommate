const db = require('../db');

exports.getFilteredApartments = async (req, res) => {
  const userId = req.params.id;

  try {
    const userResult = await db.query(`
      SELECT budget, location
      FROM profil_users
      WHERE user_id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { budget, location } = userResult.rows[0];

    if (!budget || !location) {
      return res.status(400).json({ error: 'Budget ou location manquant dans le profil utilisateur' });
    }

    const budgetInt = Math.round(Number(budget));
    const minBudget = budgetInt - 1000;
    const maxBudget = budgetInt + 1000;

    // 🔎 Rechercher les propriétés compatibles
    const propertiesResult = await db.query(`
      SELECT *
      FROM properties
      WHERE status = 'available'
        AND price BETWEEN $1 AND $2
        AND LOWER(address) LIKE '%' || LOWER($3) || '%'
    `, [minBudget, maxBudget, location]);

    const properties = propertiesResult.rows;

    // 💾 Enregistrement dans available_apartment s'ils ne sont pas déjà liés à cet user
    for (const prop of properties) {
      await db.query(`
        INSERT INTO available_apartment (user_id, property_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM available_apartment WHERE user_id = $1 AND property_id = $2
        )
      `, [userId, prop.id]);
    }

    res.json(properties);
  } catch (error) {
    console.error('❌ Erreur getFilteredApartments :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
exports.saveAvailableApartments = async (req, res) => {
  const userId = req.params.id;
  const properties = req.body.properties; // tableau d'IDs

  if (!Array.isArray(properties) || properties.length === 0) {
    return res.status(400).json({ error: "Liste des propriétés vide ou invalide." });
  }

  try {
    for (const propertyId of properties) {
      await db.query(
        `
        INSERT INTO available_apartment (user_id, property_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM available_apartment WHERE user_id = $1 AND property_id = $2
        )
        `,
        [userId, propertyId]
      );
    }

    res.status(200).json({ message: "Appartements enregistrés avec succès." });
  } catch (err) {
    console.error("❌ Erreur saveAvailableApartments :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
// Ajoute à la table favorites
exports.addToFavorites = async (req, res) => {
  const { user_id, property_id } = req.body;

  try {
    await db.query(`
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [user_id, property_id]);

    res.status(200).json({ message: 'Ajouté aux favoris.' });
  } catch (err) {
    console.error('Erreur ajout favori:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprime de apartment_valid
exports.deleteValidApartment = async (req, res) => {
  const propertyId = req.params.id;

  try {
    await db.query(`DELETE FROM apartment_valid WHERE property_id = $1`, [propertyId]);
    res.status(200).json({ message: 'Appartement supprimé' });
  } catch (err) {
    console.error('Erreur suppression:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
