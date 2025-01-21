const Transaction = require('../../models/transaction');
const Budget = require('../../models/budget');
const { getDataWithCaching, fetchCategoryFromAI, throwError } = require('../../utils/functions');
const redisClient = require('../../config/redis');
const { logger } = require('../../utils/logger');

async function routeWrapper(req, res, next, handler) {
  logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
  try {
    const result = await handler();
    logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    return result;
  } catch (err) {
    throw err
  }
}

const transactionResolvers = {
  Query: {
    transaction: async (_, { id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const transaction = await getDataWithCaching(redisClient, `transaction:${id}`, async () => {
          return await Transaction.findOne({ _id: id, user_id: req.user.uid });
        })
        if (!transaction) {
          throwError('not found', 404);
        }
        return transaction;
      }),

    transactions: async (_, { budget_id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const transactions = await getDataWithCaching(redisClient, `transactions:${budget_id}`, async () => {
          return await Transaction.find({ budget_id, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        if (!transactions) {
          throwError('not found', 404);
        }
        return transactions;
      }),
  },

  Mutation: {
    createTransaction: async (_, { budget_id, transaction }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const { type, amount, date, title } = transaction;
        const category = type === "expense" ? await fetchCategoryFromAI('asd', title) : 'Income'

        const newTransaction = await Transaction.create({
          user_id: req.user.uid,
          budget_id,
          type,
          amount,
          category,
          date,
          title
        })
            
        await Budget.findByIdAndUpdate(
          budget_id,
          {
            $push: { transaction_ids: newTransaction._id },
            $addToSet: { categories: category },
            $inc: { current_balance: amount }
          }
        );
        await redisClient
          .multi()
          .del(`budget:${budget_id}`)
          .del(`default-budget:${req.user.uid}`)
          .del(`budgets:${req.user.uid}`)
          .del(`transactions:${budget_id}`)
          .exec();
        return newTransaction;
      }),

    updateTransaction: async (_, { id, edits }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const transactionOld = await Transaction.findOne({ _id: id, user_id: req.user.uid })
        if (!transactionOld) {
          throwError('not found', 404);
        }
        const transactionNew = await Transaction.findByIdAndUpdate( id, edits, { new: true } );

        if (edits.amount) {
          const subtract = edits.amount - transactionOld.amount
          await Budget.findByIdAndUpdate(
            transactionOld.budget_id, { $inc: { current_balance: subtract } }
          );
        }

        if (edits.category) {
          await Budget.findByIdAndUpdate(
            transactionOld.budget_id, { $addToSet: { categories: edits.category } }
          );
        }
        await redisClient
          .multi()
          .del(`budget:${transactionOld.budget_id}`)
          .del(`default-budget:${req.user.uid}`)
          .del(`budgets:${req.user.uid}`)
          .del(`transaction:${id}`)
          .del(`transactions:${transactionOld.budget_id}`)
          .exec(); 
        return transactionNew;
      }),
    
    deleteTransaction: async (_, { id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const { budget_id, amount } = await Transaction.findOneAndDelete({ _id: id, user_id: req.user.uid }).select('budget_id amount')
        if (!budget_id) {
          throwError('not found', 404);
        }
        await Budget.findByIdAndUpdate(
          budget_id,
          {
            $pull: { transaction_ids: id },
            $inc: { current_balance: -amount }
          }
        );
        await redisClient
          .multi()
          .del(`budget:${budget_id}`)
          .del(`default-budget:${req.user.uid}`)
          .del(`budgets:${req.user.uid}`)
          .del(`transaction:${id}`)
          .del(`transactions:${budget_id}`)
          .exec(); 
        return 'OK'
      }),
  },
};

module.exports = transactionResolvers;
