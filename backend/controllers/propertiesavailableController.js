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

    // 🎯 Ici, on filtre les adresses qui contiennent la ville (ex: "Tel Aviv") peu importe l'ordre ou la casse
    const propertiesResult = await db.query(`
      SELECT *
      FROM properties
      WHERE status = 'available'
        AND price BETWEEN $1 AND $2
        AND LOWER(address) LIKE '%' || LOWER($3) || '%'
    `, [minBudget, maxBudget, location]);

    res.json(propertiesResult.rows);
  } catch (error) {
    console.error('❌ Erreur getFilteredApartments :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
