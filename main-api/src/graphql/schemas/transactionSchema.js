const transactionSchema = `#graphql
  scalar MongoID
  scalar Date

  type Transaction {
    _id: MongoID!,
    user_id: String!,
    budget_id: String!,
    type: String!,
    amount: Int!,
    category: String!,
    date: String!,
    title: String!,
    created_at: Date,
    updated_at: Date
  }
  type Query {
    transaction(id: MongoID!): Transaction,
    transactions(budget_id: MongoID!): [Transaction!]!
  }
  type Mutation {
    createTransaction(transaction: createTransactionInput!): Transaction
    updateTransaction(id: MongoID!, edits: updateTransactionInput): Transaction
    deleteTransaction(id: MongoID!): Boolean
  }
  input createTransactionInput {
    budget_id: String!,
    type: String!,
    amount:Int!,
    date: Date!,
    title: String!,
  }
  input updateTransactionInput {
    type: String,
    amount: Int,
    category: String,
    date: Date,
    title: String,
  }
`

module.exports = transactionSchema;