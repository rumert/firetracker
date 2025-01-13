const Budget = require('../../models/budget');
const Transaction = require('../../models/transaction');
const User = require('../../models/user');
const { getDataWithCaching, throwError } = require('../../utils/functions');
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

const budgetResolvers = {
  Query: {
    
    defaultBudget: async (_, __, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budget = await getDataWithCaching(redisClient, `default-budget:${req.user.uid}`, async () => {
          return await Budget.findOne({ user_id: req.user.uid, is_default: true })
        })
        if (!budget) {
          return null
        }
        return budget
      }),
    
    budget: async (_, { id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budget = await getDataWithCaching(redisClient, `budget:${id}`, async () => {
          return await Budget.findOne({ _id: id, user_id: req.user.uid });
        })
        if (!budget) {
          throwError('not found', 404);
        }
        return budget;
      }),

    budgets: async (_, __, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budgets = await getDataWithCaching(redisClient, `budgets:${req.user.uid}`, async () => {
          return await Budget.find({ user_id: req.user.uid });
        })
        return budgets;
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
        await redisClient
          .multi()
          .del(`budgets:${req.user.uid}`)
          .del(`default-budget:${req.user.uid}`)
          .exec();
        return newBudget;
      }),
    
    updateBudget: async (_, { id, edits }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budgetOld = await Budget.findOne({ _id: id, user_id: req.user.uid })
        if (!budgetOld) {
          throwError('not found', 404);
        }
        let budgetNew;

        if (edits.name) {
          budgetNew = await Budget.findByIdAndUpdate( id, { name: edits.name }, { new: true } );
        }

        if (edits.current_balance) {
          const subtract = edits.current_balance - budgetOld.current_balance
          budgetNew = await Budget.findByIdAndUpdate(
            id, 
            { 
              current_balance: edits.current_balance, 
              $inc: { base_balance: subtract }
            }, 
            { new: true }
          );
        }

        if (edits.category) {
          budgetNew = await Budget.findByIdAndUpdate(
            id, { $addToSet: { categories: edits.category } }, { new: true }
          );
        }

        if (edits.is_default) {
          await Budget.updateMany({ user_id: req.user.uid }, { $set: { is_default: false } });
          budgetNew = await Budget.findByIdAndUpdate(id, { $set: { is_default: edits.is_default } }, { new: true });
        }

        await redisClient
          .multi()
          .del(`budget:${id}`)
          .del(`default-budget:${req.user.uid}`)
          .del(`budgets:${req.user.uid}`)
          .exec();
        return budgetNew;
      }),
    
    deleteBudget: async (_, { id }, { req, res, next }) =>
      routeWrapper(req, res, next, async () => {
        const budget = await Budget.findOneAndDelete({ _id: id, user_id: req.user.uid })?.select('_id is_default transaction_ids')
        if (!budget?._id) {
          throwError('not found', 404);
        } 
        
        if (budget.transaction_ids?.length > 0) {
          await Transaction.deleteMany({ _id: { $in: budget.transaction_ids } });
          const pipeline = redisClient.multi();
          budget.transaction_ids.forEach(transactionId => {
            pipeline.del(`transaction:${transactionId}`);
          });
          await pipeline.exec();
        }

        if (budget.is_default) {
          await Budget.findOneAndUpdate(
            { user_id: req.user.uid },
            { $set: { is_default: true } },
            { sort: { createdAt: -1 }, new: true }
          );
        }
        await redisClient
          .multi()
          .del(`budget:${id}`)
          .del(`default-budget:${req.user.uid}`)
          .del(`budgets:${req.user.uid}`)
          .del(`transactions:${id}`)
          .exec();
        return 'OK'
      }),
  },
};

module.exports = budgetResolvers;
