import { getTokens } from "./getTokens";

function fetchOptions(token: string, params: any) {
  return {
    ...params,
    headers: {
      ...params.headers,
      'Authorization': `Bearer ${token}`
    }, 
  }
}

export default async function fetchWithTokens(url: string, params = {}) {

  const { accessToken, refreshToken } = await getTokens()
  let response = await fetch(url, fetchOptions(accessToken!, params));
  console.log('Initial tokens:', accessToken, refreshToken);
  console.log('Initial response status:', response.status);
  if (response.status === 403) {
    const refreshResponse = await fetch(`${process.env.AUTH_API_URL}/token`, fetchOptions(refreshToken!, {}));
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
