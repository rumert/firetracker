const express = require("express");
const { 
    getTransactionsInBudget,
    getDefaultBudgetId,
    getBudgetList,
    createBudget,
} = require("../controllers/budgetController");
const { validateRequest } = require('../middleware/validate-request');
const { 
    defaultBudgetId: defaultBudgetIdValidation,
    budgetList: budgetListValidation,
    budgetCreation: budgetCreationValidation,
    transactions: transactionsValidation, 
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest,
];

router.get("/default/id", validate(defaultBudgetIdValidation), getDefaultBudgetId);
router.get("/:budget_id/list", validate(budgetListValidation), getBudgetList);
router.post("/", validate(budgetCreationValidation), createBudget);
router.get("/:budget_id/transactions", validate(transactionsValidation), getTransactionsInBudget);

module.exports = router;
