const express = require("express");
const {
    getNickname, 
    updateNickname
} = require("../controllers/accountController");
const { validateRequest } = require('../middleware/validate-request');
const {
    getNicknameVal,
    updateNicknameVal,
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest
];

router.get("/nickname", validate(getNicknameVal), getNickname);
router.put("/nickname", validate(updateNicknameVal), updateNickname);

module.exports = router;
