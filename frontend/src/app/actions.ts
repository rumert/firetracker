"use server"
import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import { redirect } from "next/navigation";

export async function createBudget(isFirst: boolean, formData: FormData) {

    const name = formData.get("name") as string;
    const baseBalance = formData.get("baseBalance") as string;
    let redirectPath = undefined;

    try {
        const response = await fetchWithTokens(`${process.env.NODE_API_URL}/createBudget`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({ name, baseBalance, isDefault: isFirst })
        });
        const { budget } = await response.json()
        redirectPath = `/${budget._id}`
    } catch (error) {
        console.log(error)
    }
        
    redirectPath ? redirect(redirectPath) : ''
}