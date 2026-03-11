//backend\routes\questionRoutes.js
const express = require("express");
const {
  addQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
// NEW: Import the security middleware
const { protect, isRecruiter } = require("../middleware/authMiddleware");

const questionRouter = express.Router();

// Base URL: /api/questions

// ADD: Only Recruiters can add, update, or delete questions
questionRouter.post("/", protect, isRecruiter, addQuestion); // Add question
questionRouter.get("/", protect, getQuestions); // Get all (Must be logged in to view)
questionRouter.get("/:id", protect, getQuestionById); // Get single question
questionRouter.put("/:id", protect, isRecruiter, updateQuestion); // Update question
questionRouter.delete("/:id", protect, isRecruiter, deleteQuestion); // Delete question

module.exports = questionRouter;
