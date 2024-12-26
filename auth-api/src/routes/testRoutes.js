const express = require("express");
const { 
    resetDb,
    seedDb,
} = require("../controllers/testController");

const router = express.Router();

router.get("/db/reset", resetDb);
router.get("/db/seed", seedDb);

module.exports = router;