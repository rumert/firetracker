const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

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
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
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
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
    return { accessToken, maxAge: 60 * 1000 }
}

module.exports = {
    generatePasswordHash,
    createUser,
    generateRefreshToken,
    generateAccessToken
}