const express = require("express");
const { login, register, getToken } = require("../controllers/authController");
const { validateRequest } = require('../middleware/validate-request');
const { login: loginValidation, register: registerValidation } = require('../utils/validation-schemas');
const { authRateLimiter } = require("../middleware/auth-rate-limiter");

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest,
];

router.post("/login", authRateLimiter, validate(loginValidation), login);
router.post("/register", authRateLimiter, validate(registerValidation), register);
router.get("/token", getToken);

module.exports = router;