require('dotenv').config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

app.get('/protected', authenticateToken, (req, res) => {
    console.log(req.user)
    res.json('OK')
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

app.listen(4000);
