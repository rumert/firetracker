require('dotenv').config();
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error-handler');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
connectDB()

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: process.env.NODE_ENV != 'production' ? 10000 : 20, // Limit each IP to 20 requests per `window` (here, per 5 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use('/', authRoutes);
app.use(errorHandler);

module.exports = app 