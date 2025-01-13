import { Budget, CreateBudgetVariables } from "@/lib/types/budget";
import { fetchGraphQL } from "@/lib/utils/fetchGraphQL";

export async function getDefaultBudget(token: string | null = null): Promise<Budget> {
  try {
    const response: { defaultBudget: Budget | null } = await fetchGraphQL(
      `query DefaultBudget {
        defaultBudget {
          _id
          user_id
          name
          base_balance
          transaction_ids
          current_balance
          categories
          is_default
          created_at
        }
      }`, {}, token
    )
    return response.defaultBudget
  } catch (error) {
    console.log(error)
    throw Error('internal server error')
  }
}

export async function getBudget(budgetId: string, token: string | null = null): Promise<Budget> {
  try {
    const response: { budget: Budget } = await fetchGraphQL(
      `query Budget($id: MongoID!) {
        budget(id: $id) {
          _id
          user_id
          name
          base_balance
          transaction_ids
          current_balance
          categories
          is_default
          created_at
        }
      }`, {"id": budgetId}, token
    )
    return response.budget
  } catch (error) {
    throw Error('internal server error')
  }
}

export async function getBudgets(token: string | null = null): Promise<[] | [Budget]> {
  try {
    const response: { budgets: [] | [Budget] } = await fetchGraphQL(
      `query Budgets {
        budgets {
          _id
          user_id
          name
          base_balance
          transaction_ids
          current_balance
          categories
          is_default
          created_at
        }
      }`, {}, token
    )
    return response.budgets
  } catch (error) {
    throw Error('internal server error')
  }
}

export async function createBudget(variables: CreateBudgetVariables, token: string | null = null): Promise<{ _id: string }> {
  try {
    const response: { createBudget: { _id: string } } = await fetchGraphQL(
      `mutation CreateBudget($name: String!, $base_balance: Int!, $is_default: Boolean!) {
        createBudget(budget: { name: $name, base_balance: $base_balance, is_default: $is_default }) {
          _id
        }
      }`, variables, token
    )
    return response.createBudget
  } catch (error) {
    throw Error('internal server error')
  }
}
