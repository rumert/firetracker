import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return await handleUnauthenticatedRequest(req);
  }

  return await handleAuthenticatedRequest(req, refreshToken);
}

async function handleUnauthenticatedRequest(req: NextRequest): Promise<NextResponse> {
  const response = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register'
    ? NextResponse.next() 
    : NextResponse.redirect(new URL('/login', req.url));

  response.cookies.delete("access_token");
  return response;
}

async function handleAuthenticatedRequest(req: NextRequest, refreshToken: string): Promise<NextResponse> {
  const resFetch = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/token`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`,
    },
  });

  if (!resFetch.ok) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const data = await resFetch.json();
  const response = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register'
    ? NextResponse.redirect(new URL('/', req.url)) 
    : NextResponse.next();
  response.cookies.set('access_token', data.accessToken, data.tokenOptions);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};