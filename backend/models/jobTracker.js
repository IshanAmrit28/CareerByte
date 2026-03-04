const mongoose = require("mongoose");

const jobTrackerSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Interviewing", "Offer", "Rejected", "Ghosted"],
      default: "Applied",
    },
    dateApplied: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobTracker", jobTrackerSchema);
