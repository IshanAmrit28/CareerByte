const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

const LANGUAGE_MAP = {
    "cpp": 54,    // C++ (GCC 9.2.0)
    "java": 62,   // Java (OpenJDK 13.0.1)
    "python": 71  // Python (3.8.1)
};

/**
 * Execute code via Judge0
 * @param {string} source_code 
 * @param {string} language 
 * @param {string} stdin 
 * @returns {Promise<object>}
 */
const executeCode = async (source_code, language, stdin = "") => {
    try {
        const language_id = LANGUAGE_MAP[language];
        if (!language_id) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const response = await axios.post(`${JUDGE0_URL}/submissions?wait=true`, {
            source_code,
            language_id,
            stdin,
            cpu_time_limit: 2,
            memory_limit: 256000, // 256MB in KB
            redirect_stderr_to_stdout: false
        });

        return response.data;
    } catch (error) {
        console.error("Judge0 Execution Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get the status of an execution result
 * @param {number} statusId 
 * @returns {string}
 */
const getStatusMessage = (statusId) => {
    const statuses = {
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
    getStatusMessage,
    LANGUAGE_MAP
};
