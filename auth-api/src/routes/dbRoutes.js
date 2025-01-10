const express = require("express");
const { reset, seed } = require("../controllers/dbController");

const router = express.Router();

router.get("/reset", reset);
router.get("/seed", seed);

module.exports = router;