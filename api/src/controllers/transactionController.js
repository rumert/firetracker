const Transaction = require('../models/transaction');
const Budget = require('../models/budget');
const { fetchCategoryFromAI, getDataWithCaching } = require('../utils/functions');
const redisClient = require('../config/redis');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { mainServerLogger } = require('../utils/logger');

const aiModel = new GoogleGenerativeAI(process.env.AI_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });

async function routeWrapper(req, res, next, handler) {
    mainServerLogger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        mainServerLogger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const getTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const transaction = await getDataWithCaching(redisClient, `transaction:${req.user.uid}:${req.params.transaction_id}`, async () => {
            return await Transaction.findOne({ _id: req.params.transaction_id, user_id: req.user.uid });
        })
        if (!transaction) {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }
        res.json({ transaction });
    })
};

const createTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
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
    })
};

const updateTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
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
        await redisClient.del(`transaction:${req.user.uid}:${req.params.transaction_id}`)
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budget_id}`)
            
        res.json('OK')
    })
};

const deleteTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const { budget_id, amount } = await Transaction.findOneAndDelete({ _id: req.params.transaction_id, user_id: req.user.uid }).select('budget_id amount')
        await Budget.findByIdAndUpdate(
            budget_id,
            {
                $pull: { transaction_ids: req.params.transaction_id },
                $inc: { current_balance: -amount }
            }
        );
        await redisClient.del(`transaction:${req.user.uid}:${req.params.transaction_id}`)
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budget_id}`)
        res.json('OK')
    })
};

module.exports = { 
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
