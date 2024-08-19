import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
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
  });
  
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};