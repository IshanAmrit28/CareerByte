const CodingProblem = require("../models/codingProblem");
const Submission = require("../models/submission");
const { executeCode, getStatusMessage } = require("../utils/judge0");

/**
 * Run code against sample test cases
 */
const runCode = async (req, res) => {
    try {
        const { problemId, language, code } = req.body;
        
        const problem = await CodingProblem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // Only run public test cases
        const publicTestCases = problem.testCases.filter(tc => !tc.isHidden);
        
        const results = [];
        for (const tc of publicTestCases) {
            const result = await executeCode(code, language, tc.input);
            
            const normalizedOutput = result.stdout?.trim().replace(/\r\n/g, "\n") || "";
            const expectedOutput = tc.expectedOutput.trim().replace(/\r\n/g, "\n");
            
            let status = getStatusMessage(result.status.id);
            if (status === "Accepted" && normalizedOutput !== expectedOutput) {
                status = "Wrong Answer";
            }

            results.push({
                testCaseId: tc._id,
                status,
                stdout: result.stdout,
                stderr: result.stderr,
                compile_output: result.compile_output,
                time: result.time,
                memory: result.memory
            });
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit code against all test cases and save submission
 */
const submitCode = async (req, res) => {
    try {
        const { problemId, language, code } = req.body;
        
        const problem = await CodingProblem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const results = [];
        let totalTime = 0;
        let totalMemory = 0;
        let finalStatus = "Accepted";

        for (const tc of problem.testCases) {
            const result = await executeCode(code, language, tc.input);
            
            const normalizedOutput = result.stdout?.trim().replace(/\r\n/g, "\n") || "";
            const expectedOutput = tc.expectedOutput.trim().replace(/\r\n/g, "\n");
            
            let status = getStatusMessage(result.status.id);
            if (status === "Accepted" && normalizedOutput !== expectedOutput) {
                status = "Wrong Answer";
            }

            if (status !== "Accepted" && finalStatus === "Accepted") {
                finalStatus = status;
            }

            totalTime = Math.max(totalTime, parseFloat(result.time) || 0);
            totalMemory = Math.max(totalMemory, parseInt(result.memory) || 0);

            results.push({
                testCaseId: tc._id,
                status,
                time: result.time,
                memory: result.memory,
                isHidden: tc.isHidden,
                stdout: tc.isHidden ? null : result.stdout, // Don't show stdout for hidden test cases
                stderr: result.stderr,
                compile_output: result.compile_output
            });
        }

        const submission = await Submission.create({
            problem: problemId,
            user: req.user._id,
            language,
            code,
            status: finalStatus,
            results,
            totalTime,
            totalMemory
        });

        res.status(201).json({
            success: true,
            message: "Submission processed",
            submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    runCode,
    submitCode
};
