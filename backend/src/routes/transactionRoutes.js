const express = require("express");
const { 
    createTransaction,
    updateTransaction,
    deleteTransaction,
} = require("../controllers/transactionController");
const { validateRequest } = require('../middleware/validate-request');
const { 
    transactionCreation: transactionCreationValidation,
    transactionUpdate: transactionUpdateValidation,
    transactionDeletion: transactionDeletionValidation, 
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest
];

router.post("/", validate(transactionCreationValidation), createTransaction);
router.put("/:transaction_id", validate(transactionUpdateValidation), updateTransaction);
router.delete("/:transaction_id", validate(transactionDeletionValidation), deleteTransaction);

module.exports = router;
