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
const User = require('./server/models/user')

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
        const primaryBudget = await Budget.findById(req.body.budgetId);
        const budgets = await Budget.find({ user_id: req.user.uid }, '_id name is_default');
        console.log(budgets)
        res.json({ primaryBudget, budgets });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
});

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
