//tools
require('dotenv').config();
const jwt = require("jsonwebtoken");

//express
const express = require("express");
const app = express();
app.use(express.json());

//db
const connectDB = require('../config/db')
connectDB()
const Budget = require('../models/budget');
const User = require('../models/user');
const Transaction = require('../models/transaction');

//ai
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

//Redis
const Redis = require ("redis")
const redisClient = Redis.createClient(
    {
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: 14639
        }
    }
)
redisClient.connect();
const default_expiration = 3600

//functions
async function fetchCategoryFromAI(expenseTitle) {
    const listOfCategories = 'Groceries, Utilities, Transportation, Entertainment, Dining, Healthcare, Clothing, Education, Travel, Hobbies'
    const prompt = `Categorize the following expense title into one of these categories: ${listOfCategories}.\n\nTitle: ${expenseTitle}.\n\nDon't give me a response other than the category. If it fits more than one category, pick whatever you want.`
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

async function getDataWithCaching(cacheKey, cb) {
    const data = await redisClient.get(cacheKey)
    if (data != null) {
        return JSON.parse(data)
    }
    const freshData = await cb()
    await redisClient.setEx(cacheKey, default_expiration, JSON.stringify(freshData))
    return freshData
}

//test
app.get('/test', async (req, res) => {
    res.json('OK')
})

app.get('/reset-redis', authenticateToken, async (req, res) => {

    try {
        await redisClient.flushAll()
        res.json('OK')
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

//budget routes
app.get('/default-budget-id', authenticateToken, async (req, res) => {
    try {
        const budgetId = await getDataWithCaching(`default_budget:${req.user.uid}:id`, async () => {
            return ( await Budget.exists({ user_id: req.user.uid, is_default: true }) )._id
        })
        res.json({ budgetId })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.get('/budget-list/:budgetId', authenticateToken, async (req, res) => {
    try {
        const currentBudget = await Budget.findOne({ _id: req.params.budgetId, user_id: req.user.uid });
        if (!currentBudget) return res.sendStatus(403)
        const list = await getDataWithCaching(`budget-list:${req.user.uid}`, async () => {
            return await Budget.find({ user_id: req.user.uid }, '_id name is_default');
        })
        res.json({ currentBudget, list });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/budget', authenticateToken, async (req, res) => {
    try {
        const budget = await Budget.create({
            name: req.body.name,
            base_balance: Number(req.body.baseBalance),
            user_id: req.user.uid,
            is_default: req.body.isDefault
        })
        await User.findByIdAndUpdate(req.user.uid, { $push: { budget_ids: budget.id } }, {new: true, useFindAndModify: false})
        await redisClient.del(`budget-list:${req.user.uid}`)
        res.json({ budget })
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

//transaction routes
app.get('/transactions/:budgetId', authenticateToken, async (req, res) => {
    try {
        const transactions = await getDataWithCaching(`transactions:${req.user.uid}:${req.params.budgetId}`, async () => {
            return await Transaction.find({ budget_id: req.params.budgetId, user_id: req.user.uid }).sort({ created_at: 'desc' })
        })
        res.json({ transactions });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/transaction', authenticateToken, async (req, res) => {
    try {
        const category = req.body.type === "expense" ? await fetchCategoryFromAI(req.body.title) : 'Income'
        const transaction = await Transaction.create({
            user_id: req.user.uid,
            budget_id: req.body.budgetId,
            type: req.body.type,
            amount: req.body.amount,
            category,
            date: req.body.date,
            title: req.body.title
        })
        
        await Budget.findByIdAndUpdate(
            req.body.budgetId,
            {
                $push: { transaction_ids: transaction._id },
                $addToSet: { categories: category },
                $inc: { current_balance: req.body.amount }
            }
        );
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budgetId}`)
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.put('/transaction', authenticateToken, async (req, res) => {
    try {
        await Transaction.findByIdAndUpdate(
            req.body.transactionId,
            req.body.dataToUpdate
        );

        if (req.body.dataToUpdate.amount) {
            const amount = req.body.dataToUpdate.amount - req.body.amount
            await Budget.findByIdAndUpdate(
                req.body.budgetId, { $inc: { current_balance: amount } }
            );
        }

        if (req.body.dataToUpdate.category) {
            await Budget.findByIdAndUpdate(
                req.body.budgetId, { $addToSet: { categories: req.body.dataToUpdate.category } }
            );
        }
        await redisClient.del(`transactions:${req.user.uid}:${req.body.budgetId}`)
        
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.delete('/transaction/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { budget_id, amount } = await Transaction.findOneAndDelete({ _id: req.params.transactionId }).select('budget_id amount')
        await Budget.findByIdAndUpdate(
            budget_id,
            {
                $pull: { transaction_ids: req.params.transactionId },
                $inc: { current_balance: -amount }
            }
        );
        await redisClient.del(`transactions:${req.user.uid}:${budget_id}`)
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

//middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user;
        next();
    });
}

app.listen(4000)
