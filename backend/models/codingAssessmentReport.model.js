const mongoose = require("mongoose");

const codingAssessmentReportSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissions: [{
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CodingProblem'
        },
        code: String,
        language: String,
        score: Number, // Number of test cases passed (RAW)
        totalTestCases: Number, // Total test cases (RAW)
        weightedScore: Number,
        weightedTotal: Number
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    maxPossibleScore: {
        type: Number,
        default: 0
    },
    startTime: Date,
    submitTime: Date,
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'completed'],
        default: 'in-progress'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("CodingAssessmentReport", codingAssessmentReportSchema);
