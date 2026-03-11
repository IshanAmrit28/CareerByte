const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        default: ""
    },
    expectedOutput: {
        type: String,
        required: [true, 'Expected output is required']
    },
    isHidden: {
        type: Boolean,
        default: false
    }
});

const codingProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
    },
    timeLimit: {
        type: Number,
        default: 2 // in seconds
    },
    memoryLimit: {
        type: Number,
        default: 256 // in MB
    },
    tags: [String],
    templates: {
        cpp: {
            type: String,
            default: "#include <iostream>\n\nint main() {\n    // solve here\n    return 0;\n}"
        },
        java: {
            type: String,
            default: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // solve here\n    }\n}"
        },
        python: {
            type: String,
            default: "def solve():\n    # solve here\n    pass\n\nif __name__ == \"__main__\":\n    solve()"
        }
    },
    testCases: [testCaseSchema],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("CodingProblem", codingProblemSchema);
