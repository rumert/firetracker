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
    body('name')
        .isString()
        .escape(),
    body('current_balance')
        .isNumeric({ no_symbols: true })
        .escape(),
    body('category')
        .isString()
        .escape(),
    body('is_default')
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
        body('amount').exists({ values: 'falsy' }),
        body('category').exists({ values: 'falsy' }), 
        body('date').exists({ values: 'falsy' }),
        body('title').exists({ values: 'falsy' }),
        body('type').exists({ values: 'falsy' })
    ], { message: 'No field provided to update' }),
    body('amount')
        .optional()
        .isNumeric()
        .escape(),
    body('category')
        .optional()
        .isString()
        .escape(),
    body('date')
        .optional() 
        .isString()
        .escape(),
    body('title')
        .optional() 
        .isString()
        .escape(),
    body('type')
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