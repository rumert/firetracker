const express = require("express");
const { login, getToken } = require("../controllers/authController");
const { validateRequest } = require('../middleware/validate-request');
const { login: loginValidation, token: tokenValidation } = require('../utils/validation-schemas');
const { loginRateLimiter } = require("../middleware/login-rate-limiter");

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest,
];

router.post("/login", loginRateLimiter, validate(loginValidation), login);
router.get("/token", validate(tokenValidation), getToken);

module.exports = router;