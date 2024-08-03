//tools
require('dotenv').config();
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
const budgetRoutes = require('../routes/budgetRoutes');
const transactionRoutes = require('../routes/transactionRoutes');
const connectDB = require('../config/db')

const app = express();
app.use(express.json());
app.use(helmet());
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 1000, // Limit each IP to 30 requests per `window` (here, per 5 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

connectDB()
app.use('/budget', budgetRoutes);
app.use('/transaction', transactionRoutes);

module.exports = { app }