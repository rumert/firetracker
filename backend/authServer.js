//tools
require('dotenv').config();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

//express
const express = require("express");
const app = express();
app.use(express.json());

//database
const connectDB = require('./server/config/db')
connectDB()
const User = require('./server/models/user'); 
const RefreshToken = require('./server/models/refreshToken'); 


//test
app.get("/test", (req, res) => {
    
});

//functions
async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10)
    return ( await bcrypt.hash(password, salt) )
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
    return { token: refreshToken, expires: expires_at.valueOf() }
}

function generateAccessToken(user) {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
    const expiresAt = new Date(jwt.decode(accessToken).exp * 1000)
    return { token: accessToken, expires: expiresAt.valueOf() }
}

//auth routes
app.post("/login", async (req, res) => {
    const email = req.body.email
    const DoesUserExist = await Users.findOne({ email: email });
    let uid = null
    if ( DoesUserExist ) {
        uid = DoesUserExist._id
    } else {
        const user = await createUser( email.substring(0, email.indexOf("@")), email, req.body.password )
        uid = user._id
    }

    const user = { email, uid }
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user)
    res.json({ accessToken, refreshToken });
});

app.delete("/logout", (req, res) => {
    //refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    //res.sendStatus(204);
});

//token routes
app.get("/token", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (!refreshToken) return res.sendStatus(401);
    const isRefreshTokenInDb = await Users.findOne({ token: refreshToken })
    if (!isRefreshTokenInDb) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const userWithoutExp = {email: user.email, uid: user.uid}
        const accessToken = generateAccessToken(userWithoutExp)
        return res.json({ accessToken });
    });
});

app.listen(5000);