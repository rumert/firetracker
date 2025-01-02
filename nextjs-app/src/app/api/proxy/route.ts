import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const accessToken = cookies().get("access_token")?.value;
  const refreshToken = cookies().get("refresh_token")?.value;
  const searchParams = req.nextUrl.searchParams
  const method = searchParams.get('method')
  const url = searchParams.get('url')
  const reqBody = await req.json();

  if (!method || !url) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  if (!refreshToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const fetchOptions = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...req.headers,
    },
    body: JSON.stringify(reqBody),
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 403) {
    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API_URL}/token`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );

    if (refreshResponse.status === 200) {
      const { accessToken: newAccessToken, tokenOptions } = await refreshResponse.json();

      cookies().set('access_token', newAccessToken, tokenOptions)

      response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: refreshResponse.status }
      );
    }
  }
  return NextResponse.json(await response.json(), { status: response.status });
}
