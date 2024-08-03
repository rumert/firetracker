const Transaction = require('../models/transaction');
const Budget = require('../models/budget');
const { fetchCategoryFromAI } = require('../utils/functions');
const redisClient = require('../config/redis');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const aiModel = new GoogleGenerativeAI(process.env.AI_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });

const createTransaction = async (req, res) => {
    try {
        const category = req.body.type === "expense" ? await fetchCategoryFromAI(aiModel, req.body.title) : 'Income'
        const transaction = await Transaction.create({
            user_id: req.user.uid,
            budget_id: req.body.budget_id,
            type: req.body.type,
            amount: req.body.amount,
            category,
            date: req.body.date,
            title: req.body.title
        })
            
        await Budget.findByIdAndUpdate(
            req.body.budget_id,
            {
                $push: { transaction_ids: transaction._id },
                $addToSet: { categories: category },
                $inc: { current_balance: req.body.amount }
            }
        );
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budget_id}`)
        res.json({ transaction })
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

const updateTransaction = async (req, res) => {
    try {
        const transaction_old = await Transaction.findById(req.params.transaction_id)
        await Transaction.findByIdAndUpdate(
            req.params.transaction_id,
            req.body
        );

        if (req.body.amount) {
            const amount = req.body.amount - transaction_old.amount
            await Budget.findByIdAndUpdate(
                req.body.budget_id, { $inc: { current_balance: amount } }
            );
        }

        if (req.body.category) {
            await Budget.findByIdAndUpdate(
                req.body.budget_id, { $addToSet: { categories: req.body.category } }
            );
        }
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budget_id}`)
            
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { budget_id, amount } = await Transaction.findOneAndDelete({ _id: req.params.transaction_id }).select('budget_id amount')
        await Budget.findByIdAndUpdate(
            budget_id,
            {
                $pull: { transaction_ids: req.params.transaction_id },
                $inc: { current_balance: -amount }
            }
        );
        await redisClient.del(`transactions:${req.user.uid}:${budget_id}`)
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
};

module.exports = { 
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
