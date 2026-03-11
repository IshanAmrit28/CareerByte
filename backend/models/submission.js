const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingProblem',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ["cpp", "java", "python"]
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded", "Compilation Error", "Pending"],
        default: "Pending"
    },
    results: [{
        testCaseId: mongoose.Schema.Types.ObjectId,
        status: String,
        time: Number,
        memory: Number,
        stdout: String,
        stderr: String,
        compile_output: String
    }],
    totalTime: Number,
    totalMemory: Number
}, { 
    timestamps: true 
});

module.exports = mongoose.model("Submission", submissionSchema);
