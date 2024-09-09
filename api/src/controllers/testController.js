const redisClient = require('../config/redis');
const Budget = require('../models/budget');
const User = require('../models/user');
const { createUser } = require('../utils/functions');
const { mainServerLogger }= require('../utils/logger');
const { default: mongoose } = require('mongoose');

async function routeWrapper(req, res, next, handler) {
    mainServerLogger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        mainServerLogger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const resetDb = async (req, res, next) => {
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

const seedDb = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        if (process.env.NODE_ENV !== 'test') {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }
        const user = await createUser(User, 'test', 'test@gmail.com', 'Test21')
        await Budget.create({
            user_id: user.id,
            name: 'test',
            base_balance: 100,
            is_default: true
        })
        res.json('OK');
    })
};

module.exports = { 
    resetDb,
    seedDb,
};


  