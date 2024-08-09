const { body, header, check, param, oneOf } = require("express-validator");
const RefreshToken = require("../models/refreshToken");

const login = [
    body('email')
        .isEmail()
        .withMessage('Invalid email')
        .escape(),

    body('password')
        .isString()
        .isLength({ min:6, max:20 })
        .withMessage('Password must be between 6 and 20 characters')
        .matches(/^\S*$/, 'i')
        .withMessage('Password must not contain spaces')
        .isStrongPassword({
            minLength: 6,
            minLowercase: 0,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
            returnScore: false
        })
        .withMessage('Password must contain at least a number and an uppercase letter')
        .escape(),
]

const token = [
    header('authorization')
        .notEmpty()
        .withMessage('Invalid token')
        .custom(async (value) => {
            if (!await RefreshToken.findOne({ token: value.split(' ')[1] })) {
                return false
            }
        })
        .escape()
]

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

const transactionCreation = [
    ...user,
    body('type')
        .isString()
        .withMessage('1')
        .escape(),
    body('title')
        .isString()
        .withMessage('2')
        .escape(),
    body('budget_id')
        .isMongoId()
        .withMessage('3')
        .escape(),
    body('amount')
        .isNumeric()
        .withMessage('4')
        .escape(),
    body('date')
        .custom((value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return false 
            }
            return true;
        })
        .withMessage('5')
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