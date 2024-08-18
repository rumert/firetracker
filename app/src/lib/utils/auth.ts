'use server'
import { cookies } from 'next/headers';

export async function login(email: string, password: string) {
    const res = await fetch(`${process.env.AUTH_API_URL}/login`, { 
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json()
    if (res.status != 200) {
        throw data.error
    } else {
        cookies().set('accessToken', data.accessToken.token, { expires: data.accessToken.expires, httpOnly: true }); // 1 minute in ms
        cookies().set('refreshToken', data.refreshToken.token, { expires: data.refreshToken.expires, httpOnly: true, secure: false }); // 7 days in ms
    }
};

export async function logout() {
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
};
