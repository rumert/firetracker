'use server'
import { cookies } from 'next/headers';

const AUTH_API_URL = process.env.NODE_AUTH_API_URL;

export async function login(email: string, password: string) {
    const res = await fetch(`${AUTH_API_URL}/login`, { 
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
        cookies().set('accessToken', data.accessToken.token, { expires: data.accessToken.expires }); // 1 minute in ms
        cookies().set('refreshToken', data.refreshToken.token, { expires: data.refreshToken.expires, httpOnly: true, secure: (process.env.IS_DEPLOYED === 'true' ? true : false) }); // 7 days in ms
    }
};

export async function logout() {
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
};
