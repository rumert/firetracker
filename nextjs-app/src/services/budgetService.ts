import { Budget } from "@/lib/types/budget";
import { fetchGraphQL } from "@/lib/utils/fetchGraphQL";

export async function getDefaultBudget(): Promise<Budget | null> {
  try {
    const response: Response = await fetchGraphQL(
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
        }`
    )
    console.log(response)
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
