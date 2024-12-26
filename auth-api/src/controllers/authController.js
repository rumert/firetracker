const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, generateRefreshToken, generateAccessToken } = require('../utils/functions');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const { logger }= require('../utils/logger');

async function routeWrapper(req, res, next, handler) {
    logger.info(`Request: ${req.method} ${req.originalUrl} - User: ${req.user ? req.user.uid : 'Guest'}`);
    try {
        await handler()
        logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - User: ${req.user ? req.user.uid : 'Guest'}`);
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const nickname = req.body.nickname
        const password = req.body.password
        const userIfExist = await User.findOne({ nickname });
        if ( userIfExist ) {
            if ( await bcrypt.compare(password, userIfExist.password_hash) ) {
                const userForToken = { nickname, uid: userIfExist.id }
                const { accessToken, maxAge: accessMaxAge } = generateAccessToken(userForToken);
                const { refreshToken, maxAge: refreshMaxAge } = await generateRefreshToken(RefreshToken, User, userForToken)

                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: accessMaxAge,
                });
                
                res.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: refreshMaxAge,
                });
                res.json('OK'); 
            } else {
                const error = new Error("Wrong password")
                error.status = 403
                return next(error)
            }
        } else {
            const error = new Error("No user with this nickname found.")
            error.status = 404
            return next(error)
        }
    })
};

const register = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        const nickname = req.body.nickname
        const email = req.body.email
        const password = req.body.password
        const userIfExist = await User.findOne({
            $or: [
                { email },
                { nickname }
            ]
        });
        if ( userIfExist ) {
            const error = new Error("Email already exists. Please use a different email or login.")
            error.status = 409
            return next(error)
        } else {
            const user = await createUser( User, nickname, email, password )
            const userForToken = { nickname, uid: user.id }
            const { accessToken, maxAge: accessMaxAge } = generateAccessToken(userForToken);
            const { refreshToken, maxAge: refreshMaxAge } = await generateRefreshToken(RefreshToken, User, userForToken)

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: accessMaxAge,
            });
            
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: refreshMaxAge,
            });
            res.json('OK');
        }
    })
};

const getToken = async (req, res, next) => {
    await routeWrapper(req, res, next, async () => {
        jwt.verify(req.cookies?.refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.clearCookie('access_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                });
                res.clearCookie('refresh_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                });

                const error = new Error("Forbidden")
                error.status = 403
                return next(error)
            }
            const userForToken = { nickname: user.nickname, uid: user.id }
            const { accessToken, maxAge } = generateAccessToken(userForToken)
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge,
            });
            return res.json('OK');
        });
    })
};

module.exports = { login, register, getToken };
