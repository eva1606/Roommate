const pool = require("../db");

// ✅ GET: All tasks for the property of the current user
exports.getTasksByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // 🔍 Récupérer la propriété associée à l'utilisateur
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!propertyRows.length) {
      return res.status(404).json({ message: "No property found for this user." });
    }

    const propertyId = propertyRows[0].property_id;

    // 📋 Récupérer les tâches associées à cette propriété
    const { rows: tasks } = await pool.query(
      `SELECT id, title, status, due_date, assigned_to
       FROM tasks
       WHERE property_id = $1
       ORDER BY due_date ASC`,
      [propertyId]
    );

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Server error fetching tasks." });
  }
};

// ✅ POST: Ajouter une nouvelle tâche
exports.addTask = async (req, res) => {
  const { property_id, title, created_by, assigned_to, due_date } = req.body;

  if (!property_id || !title || !created_by) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (property_id, title, created_by, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [property_id, title, created_by, assigned_to || null, due_date || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ message: "Server error adding task." });
  }
};
// ✅ PUT: Marquer une tâche comme complétée
exports.markTaskAsDone = async (req, res) => {
  const { taskId } = req.params;

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET status = 'done'
       WHERE id = $1
       RETURNING *`,
      [taskId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: "Server error updating task." });
  }
};

