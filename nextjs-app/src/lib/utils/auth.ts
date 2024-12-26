'use server'
import { cookies } from 'next/headers';

export async function login(email: string, password: string) {
    const res = await fetch(`${process.env.AUTH_API_URL}/login`, { 
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ nickname: email, password }),
        credentials: 'include'
    });
    const data = await res.json()
    if (res.status != 200) {
        throw data.error
    } else {
        cookies().set('accessToken', data.accessToken.token, { 
            expires: data.accessToken.expires,
            secure: true,
            httpOnly: true
        });
        cookies().set('refreshToken', data.refreshToken.token, { 
            expires: data.refreshToken.expires, 
            secure: true,
            httpOnly: true
        });
    }
};

export async function logout() {
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
};
