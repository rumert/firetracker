import { NextRequest, NextResponse } from "next/server";

export default async function middleWare(req: NextRequest) {
    const res = NextResponse.next()
    const accessToken = req.cookies.get('accessToken')?.value
    const refreshToken = req.cookies.get('refreshToken')?.value
    if (!accessToken && refreshToken) {
        const resFetch = await fetch(`${process.env.NODE_AUTH_API_URL}/token`, {
            headers: {
              authorization: `Bearer ${refreshToken}`
            }  
        });
        
        if (resFetch.ok) {
            const data = await resFetch.json()
            res.cookies.set("accessToken", data.accessToken.token, { expires: data.accessToken.expires })
        }
    }
    
    return res
}