import { cookies } from 'next/headers'

export async function getTokens() {
    const accessToken = cookies().get("accessToken")?.value
    const refreshToken = cookies().get("refreshToken")?.value

    return {accessToken, refreshToken}
}
