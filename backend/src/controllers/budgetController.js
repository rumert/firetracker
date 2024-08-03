const Budget = require('../models/budget');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { getDataWithCaching } = require('../utils/functions');
const redisClient = require('../config/redis');

const getDefaultBudgetId = async (req, res) => {
    try {
        const budgetId = await getDataWithCaching(redisClient, `default_budget:${req.user.uid}:id`, async () => {
            return ( await Budget.exists({ user_id: req.user.uid, is_default: true }) )._id
        })
        res.json({ budgetId })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

const getBudgetList = async (req, res) => {
    try {
        const currentBudget = await Budget.findOne({ _id: req.params.budget_id, user_id: req.user.uid });
        if (!currentBudget) return res.sendStatus(403)
        const list = await getDataWithCaching(redisClient, `budget-list:${req.user.uid}`, async () => {
            return await Budget.find({ user_id: req.user.uid }, '_id name is_default');
        })
        res.json({ currentBudget, list });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

const createBudget = async (req, res) => {
    try {
        const budget = await Budget.create({
            name: req.body.name,
            base_balance: Number(req.body.base_balance),
            user_id: req.user.uid,
            is_default: req.body.is_default
        })
        await User.findByIdAndUpdate(req.user.uid, { $push: { budget_ids: budget.id } }, {new: true, useFindAndModify: false})
        await redisClient.del(`budget-list:${req.user.uid}`)
        res.json({ budget })
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

const getTransactionsInBudget = async (req, res) => {
    try {
        const transactions = await getDataWithCaching(redisClient, `transactions:${req.user.uid}:${req.params.budget_id}`, async () => {
            return await Transaction.find({ budget_id: req.params.budget_id, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        res.json({ transactions });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

module.exports = { 
    getDefaultBudgetId,
    getBudgetList,
    createBudget,
    getTransactionsInBudget,
};
