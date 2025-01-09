const express = require("express");
const { 
    getTransaction,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} = require("../controllers/transactionController");
const { validateRequest } = require('../middleware/validate-request');
const { 
    getTransactionVal,
    getTransactionsVal,
    createTransactionVal,
    updateTransactionVal,
    deleteTransactionVal,
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest
];

router.get("/:id", validate(getTransactionVal), getTransaction);
router.get("/all/:budget_id", validate(getTransactionsVal), getTransactions);
router.post("/:budget_id", validate(createTransactionVal), createTransaction);
router.put("/:id", validate(updateTransactionVal), updateTransaction);
router.delete("/:id", validate(deleteTransactionVal), deleteTransaction);

module.exports = router;
