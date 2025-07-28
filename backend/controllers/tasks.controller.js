const pool = require("../db");

// 🔁 GET: All tasks for property of current user
exports.getTasksByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get user's property
    const { rows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ message: "No property found." });

    const propertyId = rows[0].property_id;

    const tasks = await pool.query(
      `SELECT * FROM tasks WHERE property_id = $1 ORDER BY created_at DESC`,
      [propertyId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ➕ POST: Add task
exports.addTask = async (req, res) => {
  const { user_id, label } = req.body;

  if (!user_id || !label) {
    return res.status(400).json({ message: "user_id and label required." });
  }

  try {
    // Get property for user
    const { rows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    if (!rows.length) {
      return res.status(403).json({ message: "User has no linked property." });
    }

    const property_id = rows[0].property_id;

    const result = await pool.query(
      `INSERT INTO tasks (user_id, property_id, label)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, property_id, label]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ✅ PATCH: Mark task as done
exports.markTaskDone = async (req, res) => {
  const { taskId } = req.params;

  try {
    await pool.query(`UPDATE tasks SET is_done = true WHERE id = $1`, [taskId]);
    res.json({ message: "Task marked as done." });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: "Server error." });
  }
};
