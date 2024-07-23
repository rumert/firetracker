//tools
require('dotenv').config();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

//express
const express = require("express");
const app = express();
app.use(express.json());

//database
const connectDB = require('../config/db')
connectDB()
const mongoose = require('mongoose');
const User = require('../models/user'); 
const RefreshToken = require('../models/refreshToken'); 

//functions
async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

async function createUser(username, email, password) {
    return await User.create({
        username,
        email,
        password_hash: await generatePasswordHash(password)
    })
}

async function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    const expires_at = new Date(jwt.decode(refreshToken).exp * 1000)
    await RefreshToken.create({
        user_id: user.uid,
        token: refreshToken,
        expires_at
    })
    await User.findByIdAndUpdate(user.uid, { $push: { refresh_token_ids: refreshToken } }, {new: true, useFindAndModify: false})
    return { token: refreshToken, expires: expires_at.valueOf() }
}

function generateAccessToken(user) {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date(jwt.decode(accessToken).exp * 1000)
    return { token: accessToken, expires: expiresAt.valueOf() }
}

//routes
app.post("/login", async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userIfExist = await User.findOne({ email: email });
    let uid = null
    if ( userIfExist ) {
        if ( await bcrypt.compare(password, userIfExist.password_hash) ) {
            uid = userIfExist.id 
        } else {
            return res.status(403).send({ message: "Wrong password" })
        }
    } else {
        const user = await createUser( email.split('@')[0], email, password )
        uid = user.id
    }
    const user = { email, uid }
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user)
    res.json({ accessToken, refreshToken });
});

app.get("/token", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (!refreshToken) return res.sendStatus(401);
    const isRefreshTokenInDb = await RefreshToken.findOne({ token: refreshToken })
    if (!isRefreshTokenInDb) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const userWithoutExp = {email: user.email, uid: user.uid}
        const accessToken = generateAccessToken(userWithoutExp)
        return res.json({ accessToken });
    });
});

module.exports = {
    app,
    createUser, 
    generatePasswordHash, 
    generateRefreshToken, 
    generateAccessToken }