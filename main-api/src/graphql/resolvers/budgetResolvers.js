const Budget = require('../../models/budget');
const User = require('../../models/user');
const Transaction = require('../../models/transaction');
const { getDataWithCaching } = require('../../utils/functions');
const redisClient = require('../../config/redis');
const { logger } = require('../../utils/logger');

async function routeWrapper(req, res, next, handler) {
  logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
  try {
    const result = await handler();
    logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    return result;
  } catch (err) {
    next(err)
  }
}

const budgetResolvers = {
  Query: {
    defaultBudget: async (_, __, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budget = await getDataWithCaching(redisClient, `default-budget:${req.user.uid}:id`, async () => {
          return await Budget.findOne({ user_id: req.user.uid, is_default: true })
        })
        if (!budget) {
          await redisClient.del(`default-budget:${req.user.uid}:id`);
          return null;
        }
        return budget
      }),

    budgets: async (_, __, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budgets = await getDataWithCaching(redisClient, `budget-list:${req.user.uid}`, async () => {
          return await Budget.find({ user_id: req.user.uid });
        })
        return budgets;
      }),

    transactions: async (_, { budget_id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const transactions = await getDataWithCaching(redisClient, `transactions:${req.user.uid}:${budget_id}`, async () => {
          return await Transaction.find({ budget_id, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        return transactions;
      }),
  },

  Mutation: {
    createBudget: async (_, { budget }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const { name, base_balance, is_default } = budget;
        const newBudget = await Budget.create({
          name,
          base_balance: Number(base_balance),
          user_id: req.user.uid,
          is_default,
        });
        await User.findByIdAndUpdate(
          req.user.uid,
          { $push: { budget_ids: newBudget.id } },
          { new: true, useFindAndModify: false }
        );
        await redisClient.del(`budget-list:${req.user.uid}`);
        return newBudget;
      }),
  },
};

module.exports = budgetResolvers;
