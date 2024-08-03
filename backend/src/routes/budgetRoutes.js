const express = require("express");
const { 
    getTransactionsInBudget,
    getDefaultBudgetId,
    getBudgetList,
    createBudget,
} = require("../controllers/budgetController");
const { authenticateToken } = require('../middleware/token-middleware');
const { validateRequest } = require('../middleware/validate-request');
const { 
    defaultBudgetId: defaultBudgetIdValidation,
    budgetList: budgetListValidation,
    budgetCreation: budgetCreationValidation,
    transactions: transactionsValidation, 
} = require('../utils/validation-schemas');

const router = express.Router();

const authenticateAndValidate = (validationSchema) => [
    authenticateToken,
    validationSchema,
    validateRequest
];

router.get("/default/id", authenticateAndValidate(defaultBudgetIdValidation), getDefaultBudgetId);
router.get("/:budget_id/list", authenticateAndValidate(budgetListValidation), getBudgetList);
router.post("/", authenticateAndValidate(budgetCreationValidation), createBudget);
router.get("/:budget_id/transactions", authenticateAndValidate(transactionsValidation), getTransactionsInBudget);

module.exports = router;
