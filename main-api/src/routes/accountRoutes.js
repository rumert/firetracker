const express = require("express");
const {
    getNickname, 
    updateNickname,
    updatePassword,
    deleteAccount
} = require("../controllers/accountController");
const { validateRequest } = require('../middleware/validate-request');
const {
    getNicknameVal,
    updateNicknameVal,
    updatePasswordVal,
    deleteAccountVal
} = require('../utils/validation-schemas');

const router = express.Router();

const validate = (validationSchema) => [
    validationSchema,
    validateRequest
];

router.get("/nickname", validate(getNicknameVal), getNickname);
router.put("/nickname", validate(updateNicknameVal), updateNickname);
router.put("/password", validate(updatePasswordVal), updatePassword);
router.delete("/", validate(deleteAccountVal), deleteAccount);

module.exports = router;
