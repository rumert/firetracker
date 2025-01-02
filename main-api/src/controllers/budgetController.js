const Budget = require('../models/budget');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { getDataWithCaching, throwError } = require('../utils/functions');
const redisClient = require('../config/redis');
const { logger }= require('../utils/logger');

async function routeWrapper(req, res, next, handler) {
    logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const getDefaultBudget = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const budget = await getDataWithCaching(redisClient, `default-budget:${req.user.uid}`, async () => {
      return await Budget.findOne({ user_id: req.user.uid, is_default: true })
    })
    if (!budget) {
      throwError('not found', 404);
    }
    res.json(budget)
  })
};

const getBudget = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const id = req.params.id
    const budget = await getDataWithCaching(redisClient, `budget:${id}`, async () => {
      return await Budget.findOne({ _id: id, user_id: req.user.uid });
    })
    if (!budget) {
      throwError('not found', 404);
    }
    res.json(budget)
  })
};

const getBudgets = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const budgets = await getDataWithCaching(redisClient, `budgets:${req.user.uid}`, async () => {
      return await Budget.find({ user_id: req.user.uid });
    })
    if (!budgets) {
      throwError('not found', 404);
    }
    res.json(budgets)
  })
};

const createBudget = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const { name, base_balance, is_default } = req.body;
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
    await redisClient.del(`budgets:${req.user.uid}`);
    res.json(newBudget);
  })
};

const updateBudget = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const id = req.params.id
    const edits = req.body.edits
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

    await redisClient.del(`budget:${id}`)
    await redisClient.del(`default-budget:${req.user.uid}`)
    await redisClient.del(`budgets:${req.user.uid}`)
        
    res.json(budgetNew);
  })
};

const deleteBudget = async (req, res, next) => {
  await routeWrapper(req, res, next, async () => {
    const id = req.params.id
    const { is_default, transaction_ids } = await Budget.findOneAndDelete({ _id: id, user_id: req.user.uid }).select('is_default transaction_ids')
    
    if (transaction_ids?.length > 0) {
      await Transaction.deleteMany({ _id: { $in: transaction_ids } });
      const pipeline = redisClient.pipeline();
      transaction_ids.forEach(transactionId => {
        pipeline.del(`transaction:${transactionId}`);
      });
      await pipeline.exec();
    }

    if (is_default) {
      await Budget.findOneAndUpdate(
        { user_id: req.user.uid },
        { $set: { is_default: true } },
        { sort: { createdAt: -1 }, new: true }
      );
      await redisClient.del(`default-budget:${req.user.uid}`)
    }
    await redisClient.del(`budget:${id}`)
    await redisClient.del(`budgets:${req.user.uid}`)
    await redisClient.del(`transactions:${id}`)
    return 'OK'
  })
};

module.exports = { 
  getDefaultBudget,
  getBudget,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
