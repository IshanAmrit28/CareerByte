const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessment.controller");
const { protect, isRecruiter } = require("../middleware/authMiddleware");

// Recruiter routes
router.post("/create", protect, isRecruiter, assessmentController.createAssessment);
router.get("/recruiter/all", protect, isRecruiter, assessmentController.getRecruiterAssessments);
router.post("/open-window/:assessmentId", protect, isRecruiter, assessmentController.openAssessmentWindow);
router.get("/reports/:assessmentId", protect, isRecruiter, assessmentController.getAssessmentReports);

// Candidate routes
router.get("/candidate/:assessmentId", protect, assessmentController.getAssessmentForCandidate);
router.post("/start/:assessmentId", protect, assessmentController.startAssessmentAttempt);
router.post("/submit-problem", protect, assessmentController.submitProblem);
router.post("/submit", protect, assessmentController.submitAssessment);
router.delete("/:assessmentId", protect, isRecruiter, assessmentController.deleteAssessment);

module.exports = router;
