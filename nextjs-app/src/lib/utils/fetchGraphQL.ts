type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any>,
  token: string | null,
): Promise<T> {
  let res;
  if(!token) {
    res = await fetch(`/api/proxy?method=POST&url=${process.env.NEXT_PUBLIC_APP_URL}/api/main/graphql`, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    });
  } else {
    res = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
  }

  const json: GraphQLResponse<T> = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL Errors: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  return json.data;
}
