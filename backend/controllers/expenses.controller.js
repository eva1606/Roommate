const pool = require("../db");

// ✅ GET: All expenses for a property rented by the user
exports.getExpensesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Trouver la propriété liée à ce user
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!propertyRows.length) {
      return res.status(404).json({ message: "No property found for user." });
    }

    const propertyId = propertyRows[0].property_id;

    // Récupérer les dépenses associées à cette propriété
    const { rows: expenses } = await pool.query(
      `SELECT e.*, u.first_name, u.last_name
       FROM expenses e
       JOIN users u ON u.id = e.user_id
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

// ✅ POST: Add new expense (if user belongs to property)
exports.addExpense = async (req, res) => {
  const { user_id, amount, label } = req.body;

  if (!user_id || !amount || !label) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Vérifier que l’utilisateur loue une propriété
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    if (!propertyRows.length) {
      return res.status(403).json({ message: "User is not linked to any property." });
    }

    const property_id = propertyRows[0].property_id;

    // Ajouter la dépense
    const { rows } = await pool.query(
      `INSERT INTO expenses (user_id, property_id, amount, label)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, property_id, amount, label]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Error adding expense:", err);
    res.status(500).json({ message: "Server error adding expense." });
  }
};
