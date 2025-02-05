'use client'
import { loginValidation } from '@/lib/utils/formValidations'

export async function login(event: React.FormEvent, form:) {
    event.preventDefault();
    const validationErr = loginValidation(form.nickname, form.password)
    if (validationErr) {
        setErrorMes(validationErr)
    } else {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`, { 
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(form),
                credentials: 'include'
            });
            if (res.ok) {
                router.push('/')
            } else {
                const resData: ILoginErrorResponse = await res.json()
                setErrorMes(resData.error)
            }
        } catch (error) {
            setErrorMes('Internal Server Error')
        }
    }
}