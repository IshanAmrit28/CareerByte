const { runCode } = require("./controllers/execution.controller");
const mongoose = require("mongoose");
require("dotenv").config();

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const CodingProblem = require("./models/codingProblem");
        const problem = await CodingProblem.findOne();
        
        if (!problem) {
            console.log("No problem found to test with.");
            process.exit(1);
        }

        console.log(`Testing with AWS Judge0 for problem: ${problem.title}`);

        const req = {
            body: {
                problemId: problem._id,
                language: "python",
                code: "print(\"Judge0 on AWS is working!\")",
            }
        };

        const res = mockRes();
        await runCode(req, res);

        console.log("Status Code:", res.statusCode);
        console.log("Response Body:", JSON.stringify(res.body, null, 2));

        if (res.statusCode === 200 && res.body.success) {
            console.log("VERIFICATION SUCCESS: Code executed correctly on AWS instance!");
        } else {
            console.log("VERIFICATION FAILED: Unexpected response from AWS.", res.statusCode);
        }

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

test();
