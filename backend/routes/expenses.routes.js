const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expenses.controller");

// GET: Toutes les dépenses liées à la propriété louée par un user
router.get("/property/:userId", expensesController.getExpensesForUserProperty);

// POST: Ajouter une dépense
router.post("/", expensesController.addExpense);

module.exports = router;
