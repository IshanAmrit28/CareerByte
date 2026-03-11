//backend\routes\reportRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");

// FIX: Import the necessary controller functions
const {
  startInterview,
  endInterview,
  viewReport,
  getUserReports,
  generateContent
} = require("../controllers/reportController"); // Assumes the controller path is correct

const reportRouter = express.Router();

// Use memory storage to avoid disk writes
const storage = multer.memoryStorage();

// Define upload object using the storage configuration
const upload = multer({ storage });

// 🛣️ Routes
// All core interview functionality is protected by 'protect' middleware
reportRouter.post(
  "/start",
  protect, // Ensures user is logged in
  upload.single("resumeFile"), // Handles the file upload (file name must match client FormData key)
  startInterview
);
reportRouter.post("/end", protect, endInterview); // Ensures user is logged in
reportRouter.get("/user", protect, getUserReports); // Fetches all reports for the logged in user
reportRouter.post("/generate-content", protect, generateContent); // Generic proxy for InterviewManager
reportRouter.get("/:reportId", protect, viewReport); // Ensures user is logged in to view report

module.exports = reportRouter;
