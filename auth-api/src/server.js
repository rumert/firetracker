require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
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
    windowMs: 60 * 1000, // a minute
    limit: process.env.NODE_ENV === 'test' ? 10000 : 30, // Limit each IP to 30 requests per `window`.
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use('/', authRoutes);
app.use(errorHandler);

module.exports = app 