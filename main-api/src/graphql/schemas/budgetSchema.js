const budgetSchema = `#graphql
  scalar MongoID
  scalar Date

  type Budget {
    _id: MongoID!,
    user_id: String!,
    name: String!,
    base_balance: Float!,
    transaction_ids: [String!]!,
    current_balance: Float!,
    categories: [String!]! ,
    is_default: Boolean!,
    created_at: Date
  }
  type Query {
    budget(id: MongoID!): Budget,
    defaultBudget: Budget,
    budgets: [Budget!]!,
  }
  type Mutation {
    createBudget(budget: createBudgetInput!): Budget
    updateBudget(id: MongoID!, edits: updateBudgetInput): Budget
    deleteBudget(id: MongoID!): Boolean
  }
  input createBudgetInput {
    name: String!,
    base_balance: Float!,
    is_default: Boolean!
  }
  input updateBudgetInput {
    name: String,
    current_balance: Float,
    categories: [String!]!,
    is_default: Boolean
  }
`

module.exports = budgetSchema;