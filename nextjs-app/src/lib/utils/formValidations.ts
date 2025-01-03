import validator from 'validator';
import { CreateTransactionForm } from '../types/transaction';

export function registerValidation( email: string, password: string ): string | undefined {
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

export function loginValidation( password: string ): string | undefined {
    
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

export function createBudgetValidation( name: string ): string | undefined {
    
    if (!validator.isLength(name, { min: 1 }))  {
        return 'Budget name should be at least 1 character'
    }
}

export function createTransactionValidation({
    date,
    title,
    amount,
    type, 
}: CreateTransactionForm): string | undefined {
    if (type != 'expense' && type != 'income') {
        return 'type must be either expense or income'
    }
    if (!validator.isLength(title, { min: 1 })) {
        return 'title cannot be empty'
    }
    if (amount <= 0)  {
        return 'amount must be a positive number'
    }
}
