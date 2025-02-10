const { NODE_ENV } = require("../config/env");
const User = require('../../src/models/user');
const RefreshToken = require('../../src/models/refreshToken');
const { logger } = require('../../src/utils/logger');
const { generateAccessToken, generateRefreshToken, throwError } = require('../utils/functions');

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

        res.json({ accessToken, refreshToken });
    });
};


module.exports = {
    getNickname,
    updateNickname,
};
