import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import { cookies } from "next/headers";

const API_URL = process.env.NODE_API_URL;

export default async function Home() {
  //const accessToken = cookies().get("accessToken")?.value
  //const refreshToken = cookies().get("refreshToken")?.value

  // try {
  //   const response = await fetchWithTokens(`${API_URL}/protected`, { accessToken, refreshToken });
  //   const data = await response.json();
  //   console.log(data)
  // } catch (error) {
  //   console.log(error)
  // }

  return (
    <main>
      <p>homeee</p>
    </main>
  );
}
