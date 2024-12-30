const { mergeResolvers } = require('@graphql-tools/merge');
const budgetResolvers = require('./budgetResolvers');
const transactionResolvers = require('./transactionResolvers');

module.exports = mergeResolvers([budgetResolvers, transactionResolvers]);
