const express = require("express");
const jobController = require("../controllers/job.controller.js");
const { protect, isRecruiter } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/post", protect, isRecruiter, jobController.postJob);
router.get("/get", jobController.getAllJobs);
router.get("/getadminjobs", protect, isRecruiter, jobController.getAdminJobs);
router.get("/get/:id", protect, jobController.getJobById);

module.exports = router;
