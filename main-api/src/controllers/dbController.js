require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
const { default: mongoose } = require('mongoose');
const redisClient = require('../config/redis');
const Budget = require('../models/budget');
const transaction = require('../models/transaction');
const User = require('../models/user');
const { randomDate } = require('../utils/functions');
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

const reset = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        if (process.env.NODE_ENV !== 'test') {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }

        while (mongoose.connection.readyState !== 1) {
            console.log('Waiting for MongoDB connection...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await mongoose.connection.db.dropDatabase();
        await redisClient.flushAll()
        res.json('OK');
    })
};

const seed = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        if (process.env.NODE_ENV !== 'test') {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }

        const budgetsData = Array.from({ length: 10 }).map((_, index) => ({
            name: `Budget_${index + 1}`,
            base_balance: Math.floor(Math.random() * 1000),
            user_id: req.user.uid,
            is_default: index === 0,
        }));
        const newBudgets = await Budget.insertMany(budgetsData);

        await User.findByIdAndUpdate(
            req.user.uid,
            { $push: { budget_ids: { $each: newBudgets.map(budget => budget._id) } } },
            { new: true, useFindAndModify: false }
        );

        for (const budget of newBudgets) {   
            const transactionsData = Array.from({ length: 20 }).map((_, index) => 
            {
                const amount = Math.floor(Math.random() * 500) + 1
                return {
                    user_id: req.user.uid,
                    budget_id: budget._id,
                    type: index % 2 === 0 ? 'expense' : 'income',
                    amount: index % 2 === 0 ? -amount : amount,
                    date: randomDate(),
                    title: `Transaction_${index + 1}`,
                    category: index % 2 === 0 ? 'expense' : 'income',
                }
            }    
            );
      
            const newTransactions = await transaction.insertMany(transactionsData);
      
            const categoryUpdates = new Set(newTransactions.map(tx => tx.category));
            await Budget.findByIdAndUpdate(
              budget._id,
              {
                $push: { transaction_ids: { $each: newTransactions.map(tx => tx._id) } },
                $addToSet: { categories: { $each: Array.from(categoryUpdates) } },
                $inc: {
                  current_balance: newTransactions.reduce((sum, tx) => {
                    return tx.type === 'expense' ? sum - tx.amount : sum + tx.amount;
                  }, 0),
                }
              },
              { new: true }
            );
        }

        await redisClient.flushAll()
        res.json('OK');
    })
};

module.exports = {
    reset, 
    seed
};


  