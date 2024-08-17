require('dotenv').config();
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    if (req.path === '/test/db/reset' || req.path === '/test/db/seed') {
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            const error = new Error("Forbidden")
            error.status = 403
            return next(error)
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken }