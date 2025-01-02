const Transaction = require('../models/transaction');
const Budget = require('../models/budget');
const { fetchCategoryFromAI, getDataWithCaching, throwError } = require('../utils/functions');
const redisClient = require('../config/redis');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { logger } = require('../utils/logger');

const aiModel = new GoogleGenerativeAI(process.env.AI_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });

async function routeWrapper(req, res, next, handler) {
    logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const getTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const id = req.params.id
        const transaction = await getDataWithCaching(redisClient, `transaction:${id}`, async () => {
            return await Transaction.findOne({ _id: id, user_id: req.user.uid });
        })
        if (!transaction) {
            throwError('not found', 404);
        }
        res.json(transaction);
    })
};

const getTransactions = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const budget_id = req.params.budget_id
        const transactions = await getDataWithCaching(redisClient, `transactions:${budget_id}`, async () => {
            return await Transaction.find({ budget_id, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        if (!transactions) {
            throwError('not found', 404);
        }
        res.json(transactions);
    })
};

const createTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const budget_id = req.params.budget_id
        const { type, amount, date, title } = req.body;
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
        await redisClient.del(`transactions:${budget_id}`)
        res.json(newTransaction);
    })
};

const updateTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const id = req.params.id
        const edits = req.body.edits
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
        await redisClient.del(`transaction:${id}`)
        await redisClient.del(`transactions:${transactionOld.budget_id}`)
            
        res.json(transactionNew);
    })
};

const deleteTransaction = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const id = req.params.id
        const { budget_id, amount } = await Transaction.findOneAndDelete({ _id: id, user_id: req.user.uid }).select('budget_id amount')
        await Budget.findByIdAndUpdate(
          budget_id,
          {
            $pull: { transaction_ids: id },
            $inc: { current_balance: -amount }
          }
        );
        await redisClient.del(`transaction:${id}`)
        await redisClient.del(`transactions:${budget_id}`)
        res.json('OK')
    })
};

module.exports = { 
    getTransaction,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
