const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/tasks.controller");

router.get("/:userId", taskCtrl.getTasksByUser);
router.post("/", taskCtrl.addTask);
router.patch("/done/:taskId", taskCtrl.markTaskDone);

module.exports = router;
