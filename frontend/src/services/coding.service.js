import api from "./api";

const codingService = {
    getAllProblems: async () => {
        const response = await api.get("/coding-problems");
        return response.data;
    },
    getProblemById: async (problemId) => {
        const response = await api.get(`/coding-problems/${problemId}`);
        return response.data;
    },
    runCode: async (problemId, language, code, customInput) => {
        const response = await api.post("/execute/run", { problemId, language, code, customInput });
        return response.data;
    },
    submitCode: async (problemId, language, code) => {
        const response = await api.post("/execute/submit", { problemId, language, code });
        return response.data;
    }
};

export default codingService;
