import { getTokens } from "./getTokens";

const AUTH_API_URL = process.env.NODE_AUTH_API_URL;

function fetchOptions(token: any, params: any) {
  return {
    ...params,
    headers: {
      ...params.headers,
      'Authorization': `Bearer ${token}`
    }, 
  }
}

export default async function fetchWithTokens(url: any, params = {}) {

  const { accessToken, refreshToken } = getTokens()
  let response = await fetch(url, fetchOptions(accessToken, params));
  if (response.status === 403) {
    const refreshResponse = await fetch(`${AUTH_API_URL}/token`, fetchOptions(refreshToken, params));

    if (refreshResponse.status === 200) {
      const { accessToken: { token } } = await refreshResponse.json();
      response = await fetch(url, fetchOptions(token, params));
    } else if (refreshResponse.status === 401 || refreshResponse.status === 403) {
      const error: any = new Error("not authenticated")
      error.code = refreshResponse.status
      throw error;
    } else {
      throw new Error('Unable to refresh token');
    }
  }

  return response;
};
