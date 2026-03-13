const axios = require("axios");
const JUDGE0_URL = (process.env.JUDGE0_URL).trim().replace(/\/$/, "");


const LANGUAGE_MAP = {
    "cpp": 54,    // C++ (GCC 9.2.0)
    "java": 62,   // Java (OpenJDK 13.0.1)
    "python": 71, // Python (3.8.1)
    "javascript": 63, // JavaScript (Node.js 12.14.1)
    "kotlin": 78,    // Kotlin (1.3.70)
    "php": 68,       // PHP (7.4.1)
    "perl": 72,      // Perl (5.28.1)
    "golang": 60,    // Go (1.13.5)
    "c": 50          // C (GCC 9.2.0)
};

/**
 * Encode string to Base64
 */
const encode = (str) => {
    if (str === null || str === undefined) return "";
    return Buffer.from(str).toString("base64");
};

/**
 * Decode Base64 to string
 */
const decode = (base64) => {
    if (!base64) return "";
    return Buffer.from(base64, "base64").toString("utf-8");
};

/**
 * Execute a batch of submissions via Judge0 with polling
 * @param {Array} submissions Array of { source_code, language_id, stdin, expected_output, time_limit, memory_limit }
 * @returns {Promise<Array>} Array of results
 */
const executeBatch = async (submissions) => {
    try {
        const encodedSubmissions = submissions.map(sub => ({
            source_code: encode(sub.source_code),
            language_id: sub.language_id,
            stdin: encode(sub.stdin),
            expected_output: encode(sub.expected_output),
            cpu_time_limit: sub.time_limit || 2,
            memory_limit: (sub.memory_limit || 256) * 1024, // MB to KB
            redirect_stderr_to_stdout: false
        }));

        const judge0Url = (process.env.JUDGE0_URL).trim().replace(/\/$/, "");

        // 1. Create batch submissions
        const createResponse = await axios.post(`${judge0Url}/submissions/batch?base64_encoded=true`, {
            submissions: encodedSubmissions
        });

        // Ensure we properly map the tokens from the created response
        let tokens = "";
        if (Array.isArray(createResponse.data)) {
            tokens = createResponse.data.map(sub => sub.token).join(',');
        } else {
            console.error("Unexpected Batch Response Context:", createResponse.data);
            throw new Error("Invalid response format from Judge0 batch creation");
        }

        if (!tokens) {
            throw new Error("No tokens returned from Judge0 batch creation.");
        }

        // 2. Poll for results
        let allFinished = false;
        let finalResults = [];
        let attempts = 0;
        const maxAttempts = 60; // ~30 seconds max wait

        while (!allFinished && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            attempts++;

            // Note: Judge0 v1.13 expects tokens string
            const pollUrl = `${judge0Url}/submissions/batch?tokens=${tokens}&base64_encoded=true`;
            const statusResponse = await axios.get(pollUrl);

            // The response in GET /submissions/batch?tokens=... returns { submissions: [ ... ] }
            finalResults = statusResponse.data.submissions || statusResponse.data;


            // Check if all submissions have a status > 2 (1 = In Queue, 2 = Processing)
            allFinished = finalResults.every(res => res && res.status && res.status.id > 2);
        }

        if (!allFinished) {
            throw new Error("Batch execution timed out while waiting for results from Judge0.");
        }

        // 3. Decode outputs and map to expected format
        return finalResults.map(result => {
            const statusId = result.status?.id || result.status_id;
            return {
                ...result,
                status: { id: statusId, description: getStatusMessage(statusId) },
                stdout: decode(result.stdout),
                stderr: decode(result.stderr),
                compile_output: decode(result.compile_output),
                message: decode(result.message)
            };
        });
    } catch (error) {
        console.error("Judge0 Batch Execution Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Execute single code via Judge0 (now using Batch even for single for consistency)
 */
const executeCode = async (source_code, language, stdin = "", time_limit = 2, memory_limit = 256) => {
    const language_id = LANGUAGE_MAP[language];
    if (!language_id) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const results = await executeBatch([{
        source_code,
        language_id,
        stdin,
        time_limit,
        memory_limit
    }]);

    return results[0];
};

/**
 * Get the status of an execution result
 */
const getStatusMessage = (statusId) => {
    const statuses = {
        1: "In Queue",
        2: "Processing",
        3: "Accepted",
        4: "Wrong Answer",
        5: "Time Limit Exceeded",
        6: "Compilation Error",
        7: "Runtime Error (SIGXFSZ)",
        8: "Runtime Error (SIGFPE)",
        9: "Runtime Error (SIGABRT)",
        10: "Runtime Error (NZEC)",
        11: "Runtime Error (Other)",
        12: "Internal Error",
        13: "Exec Format Error"
    };
    return statuses[statusId] || "Unknown Error";
};

module.exports = {
    executeCode,
    executeBatch,
    getStatusMessage,
    LANGUAGE_MAP
};
