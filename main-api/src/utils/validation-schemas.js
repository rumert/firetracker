const { body, check, param, oneOf } = require("express-validator");

const user = [
    check('user')
        .custom(async (value, { req }) => {
            if ( !req.user?.email || !req.user?.uid ) {
                return false 
            }
        })
]

const defaultBudgetId = [
    ...user
]

const budgetList = [
    ...user,
    param('budget_id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape()
]

const budgetCreation = [
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

const transactions = [
    ...user,
    param('budget_id')
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape()
]

const transaction = [
    ...user,
    param('transaction_id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape()
]

const transactionCreation = [
    ...user,
    body('type')
        .isString()
        .escape(),
    body('title')
        .isString()
        .escape(),
    body('budget_id')
        .isMongoId()
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

const transactionUpdate = [
    ...user,
    param('transaction_id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape(),
    oneOf([
        body('amount').exists({ values: 'falsy' }),
        body('category').exists({ values: 'falsy' }), 
        body('date').exists({ values: 'falsy' }),
        body('title').exists({ values: 'falsy' })
    ], { message: 'No field provided' }),
    body('budget_id')
        .if( body('amount').notEmpty() || body('category').notEmpty() )
        .isMongoId()
        .withMessage('Invalid budget id')
        .escape(),
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
]

const transactionDeletion = [
    ...user,
    param('transaction_id')
        .isMongoId()
        .withMessage('Invalid transaction id')
        .escape(),
]

module.exports = { 
    defaultBudgetId,
    budgetList,
    budgetCreation,
    transactions,
    transaction,
    transactionCreation,
    transactionUpdate,
    transactionDeletion,
}