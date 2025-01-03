import validator from 'validator';

export function registerValidation<String>( email: string, password: string ) {
    if ( !validator.isEmail(email) ) {
        return 'Invalid email'
    } else if (!validator.isLength(password, { min: 6, max: 20 }))  {
        return 'Password must be between 6 and 20 characters'
    } else if (password.includes(' ')) {
        return 'Password cannot contain spaces'
    }

    const isPasswordStrong = validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 0,
        minUppercase: 1, 
        minNumbers: 1, 
        minSymbols: 0, 
        returnScore: false,
    })

    if (!isPasswordStrong) {
        return 'Password must contain at least a number and an uppercase letter'
    }
}

export function loginValidation<String>( password: string ) {
    
    if (!validator.isLength(password, { min: 6, max: 20 }))  {
        return 'Password must be between 6 and 20 characters'
    } else if (password.includes(' ')) {
        return 'Password cannot contain spaces'
    }

    const isPasswordStrong = validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 0,
        minUppercase: 1, 
        minNumbers: 1, 
        minSymbols: 0, 
        returnScore: false,
    })

    if (!isPasswordStrong) {
        return 'Password must contain at least a number and an uppercase letter'
    }
}

export function createBudgetValidation<String>( name: string ) {
    
    if (!validator.isLength(name, { min: 0 }) )  {
        return 'Budget name should be at least 1 character'
    }
}
