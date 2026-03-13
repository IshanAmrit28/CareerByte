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
        },
        javascript: {
            type: String,
            default: "function solve() {\n    // solve here\n}\n\nsolve();"
        },
        kotlin: {
            type: String,
            default: "import java.util.*\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    // solve here\n}"
        },
        php: {
            type: String,
            default: "<?php\n\n// solve here\n\n?>"
        },
        perl: {
            type: String,
            default: "use strict;\nuse warnings;\n\n# solve here\n"
        },
        golang: {
            type: String,
            default: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // solve here\n}"
        }
    },
    testCases: [testCaseSchema],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visibilityStatus: {
        type: String,
        enum: ['public', 'contest', 'private'],
        default: 'public'
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        description: 'Used for private questions added by recruiters'
    },
    points: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("CodingProblem", codingProblemSchema);
