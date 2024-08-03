const express = require("express");
const { 
    createTransaction,
    updateTransaction,
    deleteTransaction,
} = require("../controllers/transactionController");
const { authenticateToken } = require('../middleware/token-middleware');
const { validateRequest } = require('../middleware/validate-request');
const { 
    transactionCreation: transactionCreationValidation,
    transactionUpdate: transactionUpdateValidation,
    transactionDeletion: transactionDeletionValidation, 
} = require('../utils/validation-schemas');

const router = express.Router();

const authenticateAndValidate = (validationSchema) => [
    authenticateToken,
    validationSchema,
    validateRequest
];

router.post("/", authenticateAndValidate(transactionCreationValidation), createTransaction);
router.put("/:transaction_id", authenticateAndValidate(transactionUpdateValidation), updateTransaction);
router.delete("/:transaction_id", authenticateAndValidate(transactionDeletionValidation), deleteTransaction);

module.exports = router;
