import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  console.log('Middleware called, pathname:', req.nextUrl.pathname);
  console.log('Refresh token:', refreshToken);

  if (!refreshToken) {
    console.log('no refresh token')
    return await handleUnauthenticatedRequest(req);
  }

  return await handleAuthenticatedRequest(req, refreshToken);
}

async function handleUnauthenticatedRequest(req: NextRequest): Promise<NextResponse> {
  const response = req.nextUrl.pathname === '/login' 
    ? NextResponse.next() 
    : NextResponse.redirect(new URL('/login', req.url));

  response.cookies.delete("accessToken");
  return response;
}

async function handleAuthenticatedRequest(req: NextRequest, refreshToken: string): Promise<NextResponse> {
  const resFetch = await fetch(`${process.env.AUTH_API_URL}/token`, {
    headers: {
      authorization: `Bearer ${refreshToken}`,
      'Content-type': 'application/json'
    }
  });

  if (!resFetch.ok) {
    const data = await resFetch.json()
    console.log('resfetch is not ok: ', resFetch, data)
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  const data = await resFetch.json();
  const response = req.nextUrl.pathname === '/login' 
    ? NextResponse.redirect(new URL('/', req.url)) 
    : NextResponse.next();

  response.cookies.set('accessToken', data.accessToken.token, { 
    expires: data.accessToken.expires, 
    httpOnly: true, 
    secure: false,
    sameSite: 'lax',
    path: '/',
    domain: 'ec2-13-60-69-222.eu-north-1.compute.amazonaws.com',
  });
  
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};