const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assessmentScore: {
        type: Number,
        default: 0
    },
    assessmentPercentage: {
        type: Number,
        default: 0
    },
    interviewStatus: {
        type: String,
        enum: ['locked', 'eligible', 'in_progress', 'completed'],
        default: 'locked'
    },
    interviewScore: {
        type: Number,
        default: 0
    },
    interviewReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    },
    interviewStartedAt: {
        type: Date
    },
    interviewExpiresAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
