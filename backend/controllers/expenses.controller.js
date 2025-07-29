const pool = require("../db");

// ✅ GET: Dépenses avec nom & prénom liées à la propriété d’un user
exports.getExpensesForUserProperty = async (req, res) => {
  const { userId } = req.params;

  try {
    // 🔍 Récupérer la propriété liée à cet utilisateur
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!propertyRows.length) {
      return res.status(200).json({ message: "No property found for user." });
    }

    const propertyId = propertyRows[0].property_id;

    // 📦 Récupérer les dépenses + info utilisateur
    const { rows: expenses } = await pool.query(
      `SELECT 
         e.id, 
         e.label, 
         e.amount, 
         e.date,
         u.first_name, 
         u.last_name
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE e.property_id = $1
       ORDER BY e.date DESC`,
      [propertyId]
    );

    res.json(expenses);
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    res.status(500).json({ message: "Server error fetching expenses." });
  }
};

// ✅ POST: Ajouter une nouvelle dépense
exports.addExpense = async (req, res) => {
  const { user_id, amount, label } = req.body;

  if (!user_id || !amount || !label) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Vérifie que l’utilisateur est bien lié à une propriété
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    if (!propertyRows.length) {
      return res.status(403).json({ message: "User is not linked to any property." });
    }

    const property_id = propertyRows[0].property_id;

    const { rows } = await pool.query(
      `INSERT INTO expenses (user_id, property_id, amount, label)
       VALUES ($1, $2, $3, $4)
       RETURNING id, label, amount, date`,
      [user_id, property_id, amount, label]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Error adding expense:", err);
    res.status(500).json({ message: "Server error adding expense." });
  }
};
