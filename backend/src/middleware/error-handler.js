const { mainServerLogger, authServerLogger } = require("../utils/logger");

const mainErrorHandler = (err, req, res, next) => {
    const status = err.status ?? 500
    mainServerLogger.error(`Error: ${req.method} ${req.originalUrl} - Status: ${status} - Error: ${err.message} - User: ${req.user ? req.user.uid : 'Guest'}`);
    res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
}

const authErrorHandler = (err, req, res, next) => {
    const status = err.status ?? 500
    authServerLogger.error(`Error: ${req.method} ${req.originalUrl} - Status: ${status} - Error: ${err.message} - User: ${req.user ? req.user.uid : 'Guest'}`) 
    res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
}

module.exports = {
    mainErrorHandler,
    authErrorHandler,
}