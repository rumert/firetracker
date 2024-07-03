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

export async function addTransaction( date: any, budgetId: any, currentState: any, formData: FormData ) {
  const title = formData.get('title') as string;
  const amount = formData.get('amount') as unknown as number
  const type = formData.get('type') as string;

  try {
      await fetchWithTokens(`${process.env.NODE_API_URL}/addTransaction`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          budgetId,
          type,
          amount: type === 'income' ? amount : -amount,
          date,
          title
        })
      });

      return {
        message: 'success'
      }

  } catch (error) {
    console.log(error)
    return {
      message: 'failed'
    }
  }
}

export async function updateTransaction( dataToUpdate: any, budgetId: any, transactionId: any, amount: any ) {

  try {
      await fetchWithTokens(`${process.env.NODE_API_URL}/updateTransaction`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ dataToUpdate, budgetId, transactionId, amount })
      });

      return {
        message: 'success'
      }
  } catch (error) {
    console.log(error)
    return {
      message: 'failed'
    }
  }
}