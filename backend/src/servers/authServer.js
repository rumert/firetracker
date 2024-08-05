require('dotenv').config();
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
const authRoutes = require('../routes/authRoutes');
const connectDB = require('../config/db');
const { authErrorHandler } = require('../middleware/error-handler');

const app = express();
connectDB()

app.use(express.json());
app.use(helmet());
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 1000, // Limit each IP to 30 requests per `window` (here, per 5 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use('/', authRoutes);
app.use(authErrorHandler);

module.exports = { app }