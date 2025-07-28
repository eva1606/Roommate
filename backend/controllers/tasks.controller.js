const pool = require("../db");

exports.getTasksByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // 🔍 Récupérer la propriété de l'utilisateur
    const { rows: propertyRows } = await pool.query(
      `SELECT property_id FROM roommates_properties WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!propertyRows.length) {
      return res.status(404).json({ message: "No property found." });
    }

    const propertyId = propertyRows[0].property_id;

    // 📦 Récupérer les tâches avec les infos créateur & compléteur
    const { rows: tasks } = await pool.query(
      `SELECT 
         t.id,
         t.title,
         t.status,
         t.due_date,
         json_build_object(
           'id', creator.id,
           'first_name', creator.first_name,
           'last_name', creator.last_name
         ) AS created_by,
         CASE
           WHEN completer.id IS NOT NULL THEN json_build_object(
             'id', completer.id,
             'first_name', completer.first_name,
             'last_name', completer.last_name
           )
           ELSE NULL
         END AS completed_by
       FROM tasks t
       JOIN users creator ON creator.id = t.created_by
       LEFT JOIN users completer ON completer.id = t.completed_by
       WHERE t.property_id = $1
       ORDER BY t.due_date ASC`,
      [propertyId]
    );

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Server error fetching tasks." });
  }
};



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


// ✅ PATCH: Marquer une tâche comme faite + enregistrer par qui
exports.markTaskAsDone = async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required in body." });
  }

  try {
    // ✅ Marquer comme complétée + enregistrer qui l'a fait
    const updateResult = await pool.query(
      `UPDATE tasks
       SET status = 'completed',
           completed_by = $1
       WHERE id = $2
       RETURNING *`,
      [userId, taskId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const updatedTask = updateResult.rows[0];

    // 🔁 Récupérer noms des utilisateurs (créateur + validateur)
    const userIds = [updatedTask.created_by, updatedTask.completed_by];

    const usersResult = await pool.query(
      `SELECT id, first_name, last_name FROM users WHERE id = ANY($1::int[])`,
      [userIds]
    );

    const usersMap = {};
    usersResult.rows.forEach(u => {
      usersMap[u.id] = { first_name: u.first_name, last_name: u.last_name };
    });

    res.json({
      message: "✅ Task marked as completed.",
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        due_date: updatedTask.due_date,
        created_by: usersMap[updatedTask.created_by],
        completed_by: usersMap[updatedTask.completed_by]
      }
    });
  } catch (err) {
    console.error("❌ Error marking task complete:", err);
    res.status(500).json({ message: "Server error." });
  }
};
