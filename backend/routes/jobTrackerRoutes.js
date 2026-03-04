const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTrackedJobs,
  addTrackedJob,
  updateTrackedJob,
  deleteTrackedJob,
} = require("../controllers/jobTrackerController");

const router = express.Router();

router.get("/", protect, getTrackedJobs);
router.post("/", protect, addTrackedJob);
router.put("/:id", protect, updateTrackedJob);
router.delete("/:id", protect, deleteTrackedJob);

module.exports = router;
