const { body } = require("express-validator");

const login = [
    body('nickname')
        .isString()
        .withMessage('Invalid nickname')
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

const register = [
    body('nickname')
        .isString()
        .withMessage('Invalid nickname')
        .escape(),

    body('email')
        .isEmail()
        .withMessage('Invalid email')
        .escape(),

    body('password')
        .isString()
        .isLength({ min:6, max:20 })
        .withMessage('Password must be between 6 and 20 characters')
        .matches(/^\S*$/, 'i')
        .withMessage('Password cannot contain spaces')
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

module.exports = { 
    login,
    register, 
}