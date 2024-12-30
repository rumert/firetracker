"use server"
import { fetchGraphQL } from "@/lib/utils/graphql";
import { redirect } from "next/navigation";

type CreateBudgetVariables = {
  name: string;
  base_balance: number;
  is_default: boolean;
};

type CreateBudgetRes = {
  createBudget: {
    _id: string;
  };
};

type createTransactionVariables = {
  budget_id: string;
  type: string;
  amount: number;
  date: string,
  title: string,
};

type CreateTransactionRes = {
  createTransaction: {
    _id: string;
  };
};

export async function createBudget(isDefault: boolean, formData: FormData) {

  const name = formData.get("name") as string;
  const base_balance = formData.get("baseBalance") as string;
  let redirectPath: string | null;

  try {
      const variables: CreateBudgetVariables = {
        name,
        base_balance: parseInt(base_balance, 10),
        is_default: isDefault,
      };
      const mutation = `
        mutation CreateBudget($name: String!, $base_balance: Int!, $is_default: Boolean!) {
          createBudget(budget: { name: $name, base_balance: $base_balance, is_default: $is_default }) {
            _id
          }
        }
      `;
    
      const data: CreateBudgetRes = await fetchGraphQL(mutation, variables)
      redirectPath = `/${data.createBudget._id}`
  } catch (errorMes) {
    console.log(errorMes)
    redirectPath = null
  }
        
  redirectPath ? redirect(redirectPath) : ''
}

export async function createTransaction( 
  date: string, 
  budgetId: string, 
  currentState: { message: string }, 
  formData: FormData 
) {
  const title = formData.get('title') as string;
  const amount = formData.get('amount') as string
  const type = formData.get('type') as string;

  try {
      console.log(typeof(parseInt(amount, 10)))
      const variables: createTransactionVariables = {
        budget_id: budgetId,
        type,
        amount: type === 'income' ? parseInt(amount, 10) : -parseInt(amount, 10),
        date,
        title
      };
      const mutation = `
        mutation CreateTransaction($budget_id: String!, $type: String!, $amount: Int!, $date: Date!, $title: String!) {
          createTransaction(transaction: { budget_id: $budget_id, type: $type, amount: $amount, date: $date, title: $title } ) {
            _id
          }
        }
      `;
      
      const data: CreateTransactionRes = await fetchGraphQL(mutation, variables)
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