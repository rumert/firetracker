import fetchWithTokens from "./fetchWithTokens";

type GraphQLResponse<T> = {
    data: T;
    errors?: { message: string }[];
};
  
export async function fetchGraphQL<T>(
    query: string,
    variables: Record<string, any> = {}
): Promise<T> {

    const res = await fetchWithTokens(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const json: GraphQLResponse<T> = await res.json();
    if (json.errors) {
      throw new Error(`GraphQL Errors: ${json.errors.map(e => e.message).join(', ')}`);
    }
  
    return json.data;
}
  