//tools
require('dotenv').config();
const jwt = require("jsonwebtoken");

//express
const express = require("express");
const app = express();
app.use(express.json());

//db
const connectDB = require('./server/config/db')
connectDB()
const Budget = require('./server/models/budget');
const User = require('./server/models/user');
const Transaction = require('./server/models/transaction');

//ai
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

//functions
async function getCategoryFromAI(expenseTitle) {
    const listOfCategories = 'Groceries, Utilities, Transportation, Entertainment, Dining, Healthcare, Clothing, Education, Travel, Hobbies'
    const prompt = `Categorize the following expense title into one of these categories: ${listOfCategories}.\n\nTitle: ${expenseTitle}.\n\nDon't give me a response other than the category. If it fits more than one category, pick whatever you want.`
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

//test
app.get('/test', async (req, res) => {
    res.json('OK')
})

//budget routes
app.get('/getDefaultBudgetId', authenticateToken, async (req, res) => {
    try {
        const budgetId = await Budget.exists({ user_id: req.user.uid, is_default: true });
        res.json({ budgetId });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/createBudget', authenticateToken, async (req, res) => {
    try {
        const budget = await Budget.create({
            name: req.body.name,
            base_balance: Number(req.body.baseBalance),
            user_id: req.user.uid,
            is_default: req.body.isDefault
        })
        await User.findByIdAndUpdate(req.user.uid, { $push: { budget_ids: budget.id } }, {new: true, useFindAndModify: false})
        res.json({ budget })
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/getBudgetList', authenticateToken, async (req, res) => {
    try {
        const currentBudget = await Budget.findOne({_id: req.body.budgetId, user_id: req.user.uid});
        const otherBudgets = await Budget.find({ user_id: req.user.uid }, '_id name is_default');
        res.json({ currentBudget, otherBudgets });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

//transaction routes
app.post('/addTransaction', authenticateToken, async (req, res) => {
    try {
        const category = req.body.type === "expense" ? await getCategoryFromAI(req.body.title) : 'Income'
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
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/getTransactionList', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ budget_id: req.body.budgetId, user_id: req.user.uid }).sort({ created_at: 'desc' })
        res.json({ transactions });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/deleteTransaction', authenticateToken, async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.body.transactionId);
        await Budget.findByIdAndUpdate(
            req.body.budgetId,
            {
                $pull: { transaction_ids: req.body.transactionId },
                $inc: { current_balance: -req.body.amount }
            }
        );
        res.json('OK')
    } catch (error) {
        console.error('Error creating budget:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

app.post('/updateTransaction', authenticateToken, async (req, res) => {
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
