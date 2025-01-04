import { CreateTransactionVariables, Transaction, TransactionUpdateEdits } from "@/lib/types/transaction";
import { fetchGraphQL } from "@/lib/utils/fetchGraphQL";

export async function getTransactions(
  budgetId: string, 
  token: string | null = null
): Promise<[] | [Transaction]> {
  try {
    const response: { transactions: [] | [Transaction] } = await fetchGraphQL(
      `query Transactions ($budget_id: MongoID!) {
        transactions(budget_id: $budget_id) {
          _id
          user_id
          budget_id
          type
          amount
          category
          date
          title
          created_at
          updated_at
        }
    }`, {"budget_id": budgetId}, token
    )
    return response.transactions
  } catch (error) {
    throw Error('internal server error')
  }
}

export async function createTransaction( 
  budgetId: string, 
  variables: CreateTransactionVariables,
  token: string | null = null
): Promise<{ _id: string }>  {
  try {
    const response: { createTransaction: { _id: string } } = await fetchGraphQL(
      `mutation CreateTransaction($budget_id: MongoID!, $transaction: createTransactionInput!) {
        createTransaction(budget_id: $budget_id, transaction: $transaction) {
          _id
        }
      }`, {"budget_id": budgetId, "transaction": variables}, token
    )
    return response.createTransaction
  } catch (error) {
    throw Error('internal server error')
  }
}

export async function updateTransaction( 
  transactionId: string, 
  edits: TransactionUpdateEdits,
  token: string | null = null
): Promise<Transaction>  {
  try {
    const response: { updateTransaction: Transaction } = await fetchGraphQL(
      `mutation UpdateTransaction($id: MongoID!, $edits: updateTransactionInput) {
        updateTransaction(id: $id, edits: $edits) {
          _id
          user_id
          budget_id
          type
          amount
          category
          date
          title
          created_at
          updated_at
        }
      }`, {"id": transactionId, "edits": edits}, token
    )
    return response.updateTransaction
  } catch (error) {
    throw Error('internal server error')
  }
}

export async function deleteTransaction(
  transactionId: string, 
  token: string | null = null
): Promise<'OK'> {
  try {
    await fetchGraphQL(
      `mutation DeleteTransaction($id: MongoID!) {
        deleteTransaction(id: $id)
      }`, {"id": transactionId}, token
    )
    return 'OK'
  } catch (error) {
    throw Error('internal server error')
  }
}
