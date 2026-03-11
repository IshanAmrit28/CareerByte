const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeResumeContent } = require("../controllers/resumeAnalyzerController");
const { protect } = require("../middleware/authMiddleware");

// Configure multer for memory storage (we just need the buffer for the PDF parser)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /resume/analyze
// Protected route: user must be logged in
router.post("/analyze", protect, upload.single("resume"), analyzeResumeContent);

module.exports = router;
