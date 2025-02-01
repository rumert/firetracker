require('dotenv').config({ path: `../.env.${process.env.NODE_ENV}` });
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

    if (req.path === '/db/reset') {
        return next();
    }

    const accessToken = req.headers.authorization?.split(' ')[1];

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            const error = new Error("Forbidden");
            error.status = 403;
            return next(error);
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
