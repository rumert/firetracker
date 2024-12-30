import { cookies } from 'next/headers'

export async function getTokens() {
    const accessToken = cookies().get("access_token")?.value
    const refreshToken = cookies().get("refresh_token")?.value

    return {accessToken, refreshToken}
}
