require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
const redisClient = require('../config/redis');
const Budget = require('../models/budget');
const User = require('../models/user');
const { createUser } = require('../utils/functions');
const { logger }= require('../utils/logger');
const { default: mongoose } = require('mongoose');

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
        const user = await createUser(User, 'test', 'test@test.com', 'Test123')
        const budget = await Budget.create({
            name: 'test',
            base_balance: 100,
            user_id: user.id,
            is_default: true,
        });
        await User.findByIdAndUpdate(
            user.id,
            { $push: { budget_ids: budget.id } },
            { new: true, useFindAndModify: false }
        );
        await redisClient.del(`budgets:${user.id}`);
        res.json('OK');
    })
};

module.exports = { 
    reset,
    seed,
};


  