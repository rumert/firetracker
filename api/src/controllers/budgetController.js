const Budget = require('../models/budget');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { getDataWithCaching } = require('../utils/functions');
const redisClient = require('../config/redis');
const { mainServerLogger }= require('../utils/logger');

async function routeWrapper(req, res, next, handler) {
    mainServerLogger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        mainServerLogger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const getDefaultBudgetId = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const budget_id = await getDataWithCaching(redisClient, `default_budget:${req.user.uid}:id`, async () => {
            return ( await Budget.exists({ user_id: req.user.uid, is_default: true }) )._id
        })
        res.json({ budget_id })
    })
};

const getBudgetList = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const currentBudget = await Budget.findOne({ _id: req.params.budget_id, user_id: req.user.uid });
        if (!currentBudget) {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }
        const list = await getDataWithCaching(redisClient, `budget-list:${req.user.uid}`, async () => {
            return await Budget.find({ user_id: req.user.uid }, '_id name is_default');
        })
        res.json({ currentBudget, list });
    })
};

const createBudget = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const budget = await Budget.create({
            name: req.body.name,
            base_balance: Number(req.body.base_balance),
            user_id: req.user.uid,
            is_default: req.body.is_default
        })
        await User.findByIdAndUpdate(req.user.uid, { $push: { budget_ids: budget.id } }, {new: true, useFindAndModify: false})
        await redisClient.del(`budget-list:${req.user.uid}`)
        res.json({ budget })
    })
};

const getTransactionsInBudget = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const transactions = await getDataWithCaching(redisClient, `transactions:${req.user.uid}:${req.params.budget_id}`, async () => {
            return await Transaction.find({ budget_id: req.params.budget_id, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        res.json({ transactions });
    })
};

module.exports = { 
    getDefaultBudgetId,
    getBudgetList,
    createBudget,
    getTransactionsInBudget,
};
