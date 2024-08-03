const express = require("express");
const { login, getToken } = require("../controllers/authController");
const { validateRequest } = require('../middleware/validate-request');
const { login: loginValidation, token: tokenValidation } = require('../utils/validation-schemas');

const router = express.Router();

router.post("/login", loginValidation, validateRequest, login);
router.get("/token", tokenValidation, validateRequest, getToken);

module.exports = router;
