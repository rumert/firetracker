const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

async function fetchCategoryFromAI(aiModel, expenseTitle) {
    const listOfCategories = 'Groceries, Utilities, Transportation, Entertainment, Dining, Healthcare, Clothing, Education, Travel, Hobbies'
    const prompt = `Categorize the following expense title into one of these categories: ${listOfCategories}.\n\nTitle: ${expenseTitle}.\n\nDon't give me a response other than the category. If it fits more than one category, pick whatever you want.`
    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
}

async function getDataWithCaching(redisClient, cacheKey, cb, expiration = 3600) {
    const data = await redisClient.get(cacheKey)
    if (data != null) {
        return JSON.parse(data)
    }
    const freshData = await cb()
    await redisClient.setEx(cacheKey, expiration, JSON.stringify(freshData))
    return freshData
}

async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

async function createUser(UserModel, username, email, password) {
    return await UserModel.create({
        username,
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
    return { token: refreshToken, expires: expires_at.valueOf() }
}

function generateAccessToken(user) {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date(jwt.decode(accessToken).exp * 1000)
    return { token: accessToken, expires: expiresAt.valueOf() }
}

module.exports = {
    fetchCategoryFromAI,
    getDataWithCaching,
    generatePasswordHash,
    createUser,
    generateRefreshToken,
    generateAccessToken
}