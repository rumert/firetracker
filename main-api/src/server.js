//tools
const { NODE_ENV } = require("./config/env");
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
app.set('trust proxy', 1)
connectDB()

const allowedOrigin = NODE_ENV === 'production' 
    ? ['https://firetracker.online', 'https://www.firetracker.online'] 
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
    windowMs: 60 * 1000, // a minute
    limit: NODE_ENV === 'test' ? 1000000000 : 30, // Limit each IP to 30 requests per `window`.
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