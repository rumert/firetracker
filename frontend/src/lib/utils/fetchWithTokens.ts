
const AUTH_API_URL = process.env.NODE_AUTH_API_URL;

function authHeader(token: any) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

export default async function fetchWithTokens(url: any, tokens: any) {
  let response;

  if (tokens.accessToken) {
    response = await fetch(url, authHeader(tokens.accessToken));
  } else {
    const refreshResponse = await fetch(`${AUTH_API_URL}/token`, authHeader(tokens.refreshToken));

    if (refreshResponse.ok) {
      const { accessToken: { token } } = await refreshResponse.json();
      response = await fetch(url, authHeader(token));
    } else {
      throw new Error('Unable to refresh token');
    }
  }

  return response;
};
