const express = require("express");
const applicationController = require("../controllers/application.controller.js");
const { protect, isRecruiter } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/apply/:id", protect, applicationController.applyJob);
router.get("/get", protect, applicationController.getAppliedJobs);
router.get("/:id/applicants", protect, isRecruiter, applicationController.getApplicants);
router.post("/status/:id/update", protect, isRecruiter, applicationController.updateStatus);

module.exports = router;
