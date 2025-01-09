const express = require("express");
const { 
    getDefaultBudget,
    getBudget,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
} = require("../controllers/budgetController");
const { validateRequest } = require('../middleware/validate-request');
const { 
    getDefaultBudgetVal,
    getBudgetVal,
    getBudgetsVal,
    createBudgetVal,
    updateBudgetVal,
    deleteBudgetVal, 
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest,
];

router.get("/default", validate(getDefaultBudgetVal), getDefaultBudget);
router.get("/all", validate(getBudgetsVal), getBudgets);
router.get("/:id", validate(getBudgetVal), getBudget);
router.post("/", validate(createBudgetVal), createBudget);
router.put("/:id", validate(updateBudgetVal), updateBudget);
router.delete("/:id", validate(deleteBudgetVal), deleteBudget);

module.exports = router;
