const { ACCESS_TOKEN, REFRESH_TOKEN } = require("../config/env");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

async function getDataWithCaching(redisClient, cacheKey, cb, expiration = 3600) {
    const data = await redisClient.get(cacheKey)
    if (data != null) {
        return JSON.parse(data)
    }
    const freshData = await cb()
    await redisClient.setEx(cacheKey, expiration, JSON.stringify(freshData))
    return freshData
}

const throwError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    throw error;
};

const randomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(); 
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

async function createUser(UserModel, nickname, email, password) {
    return await UserModel.create({
        nickname,
        email,
        password_hash: await generatePasswordHash(password)
    })
}

async function generateRefreshToken(RefreshTokenModel, UserModel, user) {
    const refreshToken = jwt.sign(user, REFRESH_TOKEN, { expiresIn: '7d' });
    const expires_at = new Date(jwt.decode(refreshToken).exp * 1000)
    await RefreshTokenModel.create({
        user_id: user.uid,
        token: refreshToken,
        expires_at
    })
    await UserModel.findByIdAndUpdate(user.uid, { $push: { refresh_token_ids: refreshToken } }, {new: true, useFindAndModify: false})
    return { refreshToken, maxAge: 7 * 24 * 60 * 60 * 1000 }
}

function generateAccessToken(user) {
    const accessToken = jwt.sign(user, ACCESS_TOKEN, { expiresIn: '15m' });
    return { accessToken, maxAge: 60 * 1000 }
}

module.exports = {
    getDataWithCaching,
    throwError,
    randomDate,
    generatePasswordHash,
    createUser,
    generateRefreshToken,
    generateAccessToken
}