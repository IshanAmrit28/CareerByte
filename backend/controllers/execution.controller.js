const CodingProblem = require("../models/codingProblem");
const Submission = require("../models/submission");
const { executeBatch, getStatusMessage, LANGUAGE_MAP } = require("../utils/judge0");

/**
 * Common logic to process results from Judge0
 */
const processResults = (results, testCases) => {
    return results.map((result, index) => {
        const tc = testCases[index];
        
        // Defensive check: if result or result.status is missing, handle gracefully
        if (!result || !result.status) {
            return {
                testCaseId: tc._id,
                status: "Internal Error",
                stdout: null,
                stderr: "Execution failed to return a valid status from Judge0.",
                compile_output: null,
                time: 0,
                memory: 0,
                isHidden: tc.isHidden
            };
        }

        const normalizedOutput = result.stdout?.trim().replace(/\r\n/g, "\n") || "";
        const expectedOutput = tc.expectedOutput.trim().replace(/\r\n/g, "\n");
        
        let status = getStatusMessage(result.status.id);
        if (status === "Accepted" && normalizedOutput !== expectedOutput) {
            status = "Wrong Answer";
        }

        return {
            testCaseId: tc._id,
            status,
            stdout: tc.isHidden ? null : result.stdout,
            stderr: tc.isHidden ? null : result.stderr,
            compile_output: tc.isHidden ? null : result.compile_output,
            time: result.time,
            memory: result.memory,
            isHidden: tc.isHidden
        };
    });
};

/**
 * Run code against sample test cases
 */
const runCode = async (req, res) => {
    try {
        const { problemId, language, code, customInput } = req.body;
        
        const problem = await CodingProblem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // Prepare submissions
        let submissionsToRun = [];
        let testCasesReference = [];

        if (customInput !== undefined && customInput !== null) {
            submissionsToRun = [{
                source_code: code,
                language_id: LANGUAGE_MAP[language],
                stdin: customInput,
                time_limit: problem.timeLimit,
                memory_limit: problem.memoryLimit
            }];
            testCasesReference = [{ input: customInput, expectedOutput: "", isHidden: false, _id: "custom" }];
        } else {
            const publicTestCases = problem.testCases.filter(tc => !tc.isHidden);
            submissionsToRun = publicTestCases.map(tc => ({
                source_code: code,
                language_id: LANGUAGE_MAP[language],
                stdin: tc.input,
                expected_output: tc.expectedOutput,
                time_limit: problem.timeLimit,
                memory_limit: problem.memoryLimit
            }));
            testCasesReference = publicTestCases;
        }

        if (submissionsToRun.length === 0) {
            return res.status(200).json({ success: true, results: [] });
        }

        const rawResults = await executeBatch(submissionsToRun);
        const processedResults = processResults(rawResults, testCasesReference);

        // Special handling for the isCustom flag in the response
        if (customInput !== undefined && customInput !== null) {
            processedResults[0].isCustom = true;
        }

        res.status(200).json({ success: true, results: processedResults });
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message.includes('ECONNREFUSED') || error.message.includes('timeout') || error.message.includes('timed out')) {
            return res.status(503).json({ 
                success: false, 
                message: "Coding execution service (Judge0) is currently unreachable or timed out. Please ensure it is running." 
            });
        }
        res.status(500).json({ success: false, message: error.message || "Internal Server Error during execution." });
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

        const submissionsToRun = problem.testCases.map(tc => ({
            source_code: code,
            language_id: LANGUAGE_MAP[language],
            stdin: tc.input,
            expected_output: tc.expectedOutput,
            time_limit: problem.timeLimit,
            memory_limit: problem.memoryLimit
        }));

        const rawResults = await executeBatch(submissionsToRun);
        const results = processResults(rawResults, problem.testCases);

        let totalTime = 0;
        let totalMemory = 0;
        let finalStatus = "Accepted";

        results.forEach(res => {
            if (res.status !== "Accepted" && finalStatus === "Accepted") {
                finalStatus = res.status;
            }
            totalTime = Math.max(totalTime, parseFloat(res.time) || 0);
            totalMemory = Math.max(totalMemory, parseInt(res.memory) || 0);
        });

        const submission = await Submission.create({
            problem: problemId,
            user: req.user._id,
            language,
            code,
            status: finalStatus,
            results: results.map(r => ({ ...r, stdout: r.isHidden ? null : r.stdout })),
            totalTime,
            totalMemory
        });

        res.status(201).json({
            success: true,
            message: "Submission processed",
            submission
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message.includes('ECONNREFUSED') || error.message.includes('timeout') || error.message.includes('timed out')) {
            return res.status(503).json({ 
                success: false, 
                message: "Coding execution service (Judge0) is currently unreachable or timed out. Please ensure it is running." 
            });
        }
        res.status(500).json({ success: false, message: error.message || "Internal Server Error during submission." });
    }
};

module.exports = {
    runCode,
    submitCode
};
