const { body, check, param, oneOf } = require("express-validator");

const user = [
    check('user')
        .custom(async (value, { req }) => {
            if ( !req.user?.email || !req.user?.uid ) {
                return false 
            }
        })
]

const getDefaultBudget = [
    ...user
]

const getBudget = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape()
]

const getBudgets = [
    ...user,
]

const createBudget = [
    ...user,
    body('name')
        .isString()
        .escape(),
    body('base_balance')
        .isNumeric({ no_symbols: true })
        .escape(),
    body('is_default')
        .isBoolean()
        .escape()
]

const updateBudget = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape(),
    body('edits.name')
        .optional()
        .isString()
        .escape(),
    body('edits.current_balance')
        .optional()
        .isNumeric({ no_symbols: true })
        .escape(),
    body('edits.category')
        .optional()
        .isString()
        .escape(),
    body('edits.is_default')
        .optional()
        .isBoolean()
        .escape()
]

const deleteBudget = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape()
]

const getTransaction = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape()
]

const getTransactions = [
    ...user,
    param('budget_id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape()
]

const createTransaction = [
    ...user,
    param('budget_id')
        .isMongoId()
        .escape(),
    body('type')
        .isString()
        .escape(),
    body('title')
        .isString()
        .escape(),
    body('amount')
        .isNumeric()
        .escape(),
    body('date')
        .custom((value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return false 
            }
            return true;
        })
        .escape()
]

const updateTransaction = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape(),
    oneOf([
        body('edits.amount').exists({ values: 'falsy' }),
        body('edits.category').exists({ values: 'falsy' }), 
        body('edits.date').exists({ values: 'falsy' }),
        body('edits.title').exists({ values: 'falsy' }),
        body('edits.type').exists({ values: 'falsy' })
    ], { message: 'No field provided to update' }),
    body('edits.amount')
        .optional()
        .isNumeric()
        .escape(),
    body('edits.category')
        .optional()
        .isString()
        .escape(),
    body('edits.date')
        .optional() 
        .isString()
        .escape(),
    body('edits.title')
        .optional() 
        .isString()
        .escape(),
    body('edits.type')
        .optional()
        .isString()
        .escape(),
]

const deleteTransaction = [
    ...user,
    param('id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape(),
]

module.exports = { 
    getDefaultBudgetVal: getDefaultBudget,
    getBudgetVal: getBudget,
    getBudgetsVal: getBudgets,
    createBudgetVal: createBudget,
    updateBudgetVal: updateBudget,
    deleteBudgetVal: deleteBudget,
    getTransactionVal: getTransaction,
    getTransactionsVal: getTransactions,
    createTransactionVal: createTransaction,
    updateTransactionVal: updateTransaction,
    deleteTransactionVal: deleteTransaction,
};