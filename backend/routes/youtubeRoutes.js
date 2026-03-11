const express = require("express");
const router = express.Router();
const youtubeController = require("../controllers/youtubeController");
const { protect } = require("../middleware/authMiddleware");

// Search videos route
router.get("/search", protect, youtubeController.searchVideos);

module.exports = router;
