//backend\routes\leaderboardRoutes.js
const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/leaderboard
// @desc    Get paginated leaderboard data
// @access  Private
router.get("/", protect, leaderboardController.getLeaderboard);

module.exports = router;
