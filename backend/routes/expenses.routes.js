const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");

router.get("/property/:userId", expensesController.getExpensesByUser);
router.post("/", expensesController.addExpense);

module.exports = router;
