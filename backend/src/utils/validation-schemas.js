const { body, header, check, param, oneOf } = require("express-validator");
const RefreshToken = require("../models/refreshToken");

const login = [
    body('email')
        .isEmail()
        .escape()
        .withMessage('Invalid email'),

    body('password')
        .isString()
        .isLength({ min:6 })
        .escape()
        .withMessage('Password must be at least 6 characters long'),
]

const token = [
    header('authorization')
        .notEmpty()
        .escape()
        .withMessage('Invalid token')
        .custom(async (value) => {
            if (!await RefreshToken.findOne({ token: value.split(' ')[1] })) {
                throw new Error() 
            }
        })
]

const user = [
    check('user')
        .custom(async (value, { req }) => {
            if ( !req.user?.email || !req.user?.uid ) {
                throw new Error('Internal server error') 
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
        .escape()
        .withMessage('Invalid budget id')
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
        .escape()
        .withMessage('Invalid budget id')
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
        .isNumeric({ no_symbols: true })
        .escape(),
    body('date')
        .isString()
        .escape()
]

const transactionUpdate = [
    ...user,
    param('transaction_id')
        .isMongoId()
        .escape()
        .withMessage('Invalid transaction id'),
    oneOf([
        body('amount').exists({ values: 'falsy' }),
        body('category').exists({ values: 'falsy' }),
        body('date').exists({ values: 'falsy' }),
        body('title').exists({ values: 'falsy' })
    ], { message: 'No field provided' }),
    body('budget_id')
        .if( body('amount').notEmpty() || body('category').notEmpty() )
        .isMongoId()
        .escape()
        .withMessage('Invalid budget id'),
    body('amount')
        .optional()
        .isNumeric({ no_symbols: true })
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
        .escape()
        .withMessage('Invalid transaction id'),
]

module.exports = { 
    login,
    token, 
    defaultBudgetId,
    budgetList,
    budgetCreation,
    transactions,
    transactionCreation,
    transactionUpdate,
    transactionDeletion,
}