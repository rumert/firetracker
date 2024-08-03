const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, generateRefreshToken, generateAccessToken } = require('../utils/functions');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');

const login = async (req, res) => {
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
        const user = await createUser( User, email.split('@')[0], email, password )
        uid = user.id
    }
    const user = { email, uid }
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(RefreshToken, User, user)
    res.json({ accessToken, refreshToken });
};

const getToken = async (req, res) => {
    const refreshToken = req.headers['authorization'].split(' ')[1];
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const userWithoutExpiration = { email: user.email, uid: user.uid }
        const accessToken = generateAccessToken(userWithoutExpiration)
        return res.json({ accessToken });
    });
};

module.exports = { login, getToken };
