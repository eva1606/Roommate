const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/property/:userId", tasksController.getTasksByUser);
router.post("/", tasksController.addTask);
router.put("/:taskId/done", tasksController.markTaskAsDone);

module.exports = router;
