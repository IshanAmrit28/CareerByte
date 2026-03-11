const express = require("express");
const router = express.Router();
const { protect, isCandidate } = require("../middleware/authMiddleware");
const { runCode, submitCode } = require("../controllers/execution.controller");

router.post("/run", protect, runCode);
router.post("/submit", protect, submitCode);

module.exports = router;
