export type Budget = {
    _id: string
    user_id: string
    name: string
    base_balance: number
    transaction_ids: [string]
    current_balance: number
    categories: [string]
    is_default: boolean
    created_at: Date
} | null