'use server'
import { cookies } from 'next/headers';

const AUTH_API_URL = process.env.NODE_AUTH_API_URL;

export async function login(email: any, password: any) {
    try {
        const res = await fetch(`${AUTH_API_URL}/login`, { 
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data: any = await res.json()
        cookies().set('accessToken', data.accessToken.token, { expires: data.accessToken.expires }); // 1 minute in ms
        cookies().set('refreshToken', data.refreshToken.token, { expires: data.refreshToken.expires, httpOnly: true}); // 7 days in ms
    } catch (error) {
        console.error('Login failed', error);
        throw error;
    }
};

export async function logout() {
    const refreshToken = cookies().get('refreshToken')?.value;
    const res = await fetch(`${AUTH_API_URL}/logout`, { 
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify( { token: refreshToken } )
    });
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
};
