const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/property/:userId", tasksController.getTasksByUser);
router.post("/", tasksController.addTask);
// ✅ PATCH: marquer une tâche comme faite
router.patch("/:taskId/complete", tasksController.markTaskAsDone);

module.exports = router;
