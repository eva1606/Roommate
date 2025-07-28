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
      return res.status(404).json({ message: "No property found for user." });
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

const pool = require("../db");

// ✅ POST: Ajouter une tâche et retourner infos + nom/prénom du créateur
exports.addTask = async (req, res) => {
  const { title, due_date, created_by } = req.body;

  if (!title || !due_date || !created_by) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // 🔍 Trouver la propriété liée à l'utilisateur
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [created_by]
    );

    if (!propertyRows.length) {
      return res.status(403).json({ message: "User is not linked to a property." });
    }

    const propertyId = propertyRows[0].property_id;

    // ➕ Insérer la tâche
    const { rows } = await pool.query(
      `INSERT INTO tasks (property_id, title, due_date, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [propertyId, title, due_date, created_by]
    );

    const task = rows[0];

    // 👤 Récupérer le nom du créateur
    const { rows: userRows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [created_by]
    );

    const user = userRows[0];

    // ✅ Répondre avec tout
    res.status(201).json({
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      status: task.status,
      created_by: {
        id: created_by,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error("❌ Error adding task:", err);
    res.status(500).json({ message: "Server error adding task." });
  }
};

exports.markTaskAsDone = async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  try {
    // 🛑 Vérifier l'existence de la tâche
    const existing = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [taskId]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Task not found." });
    }

    // ✅ Marquer comme terminée et stocker l'utilisateur qui l’a faite
    const updateResult = await pool.query(
      `UPDATE tasks
       SET status = 'completed', completed_by = $1
       WHERE id = $2
       RETURNING *`,
      [userId, taskId]
    );

    const updatedTask = updateResult.rows[0];

    // 👤 Infos du créateur
    const { rows: creatorRows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [updatedTask.created_by]
    );
    const creator = creatorRows[0];

    // 👤 Infos du validateur
    const { rows: completerRows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [updatedTask.completed_by]
    );
    const completer = completerRows[0];

    // ✅ Réponse formatée
    res.json({
      message: "Task marked as completed ✅",
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        due_date: updatedTask.due_date,
        created_by: {
          id: updatedTask.created_by,
          first_name: creator.first_name,
          last_name: creator.last_name,
        },
        completed_by: {
          id: updatedTask.completed_by,
          first_name: completer.first_name,
          last_name: completer.last_name,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error marking task as completed:", err);
    res.status(500).json({ message: "Server error updating task." });
  }
};
