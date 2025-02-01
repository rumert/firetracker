const { NODE_ENV } = require("../config/env");
const rateLimit = require('express-rate-limit')

const isTestEnv = NODE_ENV === 'test';

const shortTermLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 failed login requests per window
    handler: (req, res, next) => {
        const err = new Error('Too many failed Login Attempts. Please try again in a minute')
        err.status = 429
        next(err)
    },
    requestWasSuccessful: (request, response) => isTestEnv || response.statusCode < 400,
    skipSuccessfulRequests: true,
  });

const longTermLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 failed login requests per window
    handler: (req, res, next) => {
        const err = new Error('Too many failed Login Attempts. Please try again later.')
        err.status = 429
        next(err)
    },
    requestWasSuccessful: (request, response) => isTestEnv || response.statusCode < 400,
    skipSuccessfulRequests: true,
});

const authRateLimiter = [
    shortTermLimiter,
    longTermLimiter,
]

module.exports = {
    authRateLimiter
}