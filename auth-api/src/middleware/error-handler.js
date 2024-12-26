const { logger } = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    const status = err.status ?? 500
    logger.error(`Error: ${req.method} ${req.originalUrl} - Status: ${status} - Error: ${err.message} - User: ${req.user ? req.user.uid : 'Guest'}`);
    res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
}

module.exports = {
    errorHandler,
}