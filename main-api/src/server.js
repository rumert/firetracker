//tools
require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dbRoutes = require('./routes/dbRoutes');
const connectDB = require('./config/db');
const { authenticateToken } = require('./middleware/token-middleware');
const { errorHandler } = require('./middleware/error-handler');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const initApollo = require('./config/apollo');

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
    limit: process.env.NODE_ENV === 'test' ? 1000000000 : 30, // Limit each IP to 30 requests per `window`.
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use(authenticateToken);
app.use('/db', dbRoutes);
app.use('/budget', budgetRoutes);
app.use('/transaction', transactionRoutes);
initApollo(app);

app.use(errorHandler)

module.exports = app 