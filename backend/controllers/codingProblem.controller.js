const CodingProblem = require("../models/codingProblem");

/**
 * Create a new coding problem (Admin/Recruiter)
 */
const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, timeLimit, memoryLimit, templates, testCases } = req.body;
        
        const problem = await CodingProblem.create({
            title,
            description,
            difficulty,
            timeLimit,
            memoryLimit,
            templates,
            testCases,
            created_by: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all coding problems
 */
const getAllProblems = async (req, res) => {
    try {
        const problems = await CodingProblem.find().select("-testCases"); // Hide test cases in list
        res.status(200).json({ success: true, problems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get a single problem by ID
 */
const getProblemById = async (req, res) => {
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // Filter out hidden test cases for candidates
        const responseProblem = problem.toObject();
        if (req.user.userType === "candidate") {
            responseProblem.testCases = responseProblem.testCases.filter(tc => !tc.isHidden);
        }

        res.status(200).json({ success: true, problem: responseProblem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update a coding problem (Admin/Recruiter)
 */
const updateProblem = async (req, res) => {
    try {
        const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        res.status(200).json({ success: true, message: "Problem updated", problem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a coding problem (Admin/Recruiter)
 */
const deleteProblem = async (req, res) => {
    try {
        const problem = await CodingProblem.findByIdAndDelete(req.params.id);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        res.status(200).json({ success: true, message: "Problem deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem
};
