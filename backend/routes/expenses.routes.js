const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");

router.get("/property/:userId", expensesController.getExpensesForUserProperty);

router.post("/", expensesController.addExpense);

module.exports = router;
