const { NODE_ENV } = require("../config/env");
const User = require('../../src/models/user');
const RefreshToken = require('../../src/models/refreshToken');
const Budget = require('../../src/models/budget');
const Transaction = require('../../src/models/transaction');
const { logger } = require('../../src/utils/logger');
const { generateAccessToken, generateRefreshToken, throwError, generatePasswordHash } = require('../utils/functions');
const bcrypt = require("bcrypt");

async function routeWrapper(req, res, next, handler) {
  logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
  try {
    await handler()
    logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
  } catch (err) {
    next(err)
  }
}

const getNickname = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        res.json({ nickname: req.user.nickname });
    });
};

const updateNickname = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const userId = req.user.uid;
        const newNickname = req.body.nickname;

        const existingUser = await User.findOne({ nickname: newNickname });
        if (existingUser) {
            throwError('Nickname already exists. Please choose another.', 409);
        }

        await User.findByIdAndUpdate(
            userId,
            { nickname: newNickname },
            { new: true }
        );

        await RefreshToken.deleteMany({ user_id: userId });

        const userForToken = { nickname: newNickname, uid: userId };
        const { accessToken, maxAge: accessMaxAge } = generateAccessToken(userForToken);
        const { refreshToken, maxAge: refreshMaxAge } = await generateRefreshToken(RefreshToken, User, userForToken);

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: accessMaxAge,
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: refreshMaxAge,
        });

        res.json({ newNickname, accessToken, refreshToken });
    });
};

const updatePassword = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const userId = req.user.uid;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId)

        if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
            throwError('Current password is incorrect', 401);
        }

        const password_hash = await generatePasswordHash(newPassword)

        await User.findByIdAndUpdate(
            userId,
            { password_hash },
            { new: true }
        );

        res.json('OK');
    });
};

const deleteAccount = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const userId = req.user.uid;
        const { password } = req.body;

        const user = await User.findById(userId)

        if (!(await bcrypt.compare(password, user.password_hash))) {
            throwError('Password is incorrect', 401);
        }

        await RefreshToken.deleteMany({ token: user.refresh_token_ids })
        
        const budgets = await Budget.find({ user_id: userId });
        const budgetIds = budgets.map(budget => budget._id);

        await Budget.deleteMany({ user_id: userId });
        await Transaction.deleteMany({ budget_id: { $in: budgetIds } });

        await User.findByIdAndDelete(userId);

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.json('OK');
    });
};

module.exports = {
    getNickname,
    updateNickname,
    updatePassword,
    deleteAccount,
};
