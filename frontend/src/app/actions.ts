"use server"
import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import { redirect } from "next/navigation";

export async function createBudget(isDefault: boolean, formData: FormData) {

  const name = formData.get("name") as string;
  const base_balance = formData.get("baseBalance") as unknown as number;
  let redirectPath: string | null;

  try {
      const res = await fetchWithTokens(`${process.env.MAIN_API_URL}/budget`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ name, base_balance, is_default: isDefault })
      });
      const data = await res.json()
      if (!res.ok) throw data.error
      redirectPath = `/${data.budget._id}`
  } catch (errorMes) {
    console.log(errorMes)
    redirectPath = null
  }
        
  redirectPath ? redirect(redirectPath) : ''
}

export async function addTransaction( 
  date: string, 
  budgetId: string, 
  currentState: { message: string }, 
  formData: FormData 
) {
  const title = formData.get('title') as string;
  const amount = formData.get('amount') as unknown as number
  const type = formData.get('type') as string;

  try {
      const res = await fetchWithTokens(`${process.env.MAIN_API_URL}/transaction`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          budget_id: budgetId,
          type,
          amount: type === 'income' ? amount : -amount,
          date,
          title
        })
      });

      if (!res.ok) {
        const data = await res.json()
        console.log(data.error)
        return {
          message: 'failed'
        }
      }

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

export async function updateTransaction( 
  fieldToUpdate: object, 
  transactionId: string, 
  budgetId: string, 
) {

  try {
      await fetchWithTokens(`${process.env.MAIN_API_URL}/transaction/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ budget_id: budgetId, ...fieldToUpdate })
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