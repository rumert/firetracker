export type Transaction = {
  _id: string
  user_id: string
  budget_id: string
  type: string
  amount: number
  category: string
  date: string
  title: string
  created_at: Date
  updated_at: Date
}

export type TransactionUpdateEdits = {
  type?: string,
  amount?: number,
  category?: string,
  date?: string,
  title?: string
}