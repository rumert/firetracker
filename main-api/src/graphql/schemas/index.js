const { mergeTypeDefs } = require('@graphql-tools/merge');
const budgetSchema = require('./budgetSchema');
const transactionSchema = require('./transactionSchema');

module.exports = mergeTypeDefs([budgetSchema, transactionSchema]);
