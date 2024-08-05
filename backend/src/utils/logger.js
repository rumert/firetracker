const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const mainServerLogger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: 'main.log' })
    ],
});

const authServerLogger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: 'auth.log' })
    ],
});

module.exports = {
    mainServerLogger,
    authServerLogger
};
