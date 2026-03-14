const CodingProblem = require("../models/codingProblem");
const Submission = require("../models/submission");
const { canUserAccessProblem } = require("../utils/visibilityHelper");

/**
 * Create a new coding problem (Admin/Recruiter)
 */
const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, timeLimit, memoryLimit, tags, templates, testCases, visibilityStatus } = req.body;
        
        const isRecruiter = (req.user.userType || "").toLowerCase().trim() === 'recruiter';
        
        // Final visibility determined by role
        let finalVisibility = visibilityStatus || 'public';
        if (isRecruiter) {
            finalVisibility = 'private';
        }

        const problem = await CodingProblem.create({
            title,
            description,
            difficulty,
            timeLimit,
            memoryLimit,
            tags,
            templates,
            testCases,
            created_by: req.user._id,
            visibilityStatus: finalVisibility,
            ownerId: isRecruiter ? req.user._id : undefined
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

const { performVisibilityCleanup } = require("../utils/cleanupTask");

/**
 * Get all coding problems
 */
const getAllProblems = async (req, res) => {
    try {
        // Just-In-Time visibility update for ended contests/assessments
        await performVisibilityCleanup();

        const userType = (req.user.userType || "").toLowerCase().trim();
        let query = { visibilityStatus: "public" };

        if (userType === 'admin') {
            query = {}; // All problems
        } else if (userType === 'recruiter') {
            // Public problems + all private problems (cross-company access for recruiters)
            query = {
                $or: [
                    { visibilityStatus: "public" },
                    { visibilityStatus: "private" }
                ]
            };
        }

        const problems = await CodingProblem.find(query).select("-testCases").lean(); 
        
        // If candidate, check which problems they have solved
        if (req.user.userType === "candidate") {
            const solvedProblemIds = await Submission.find({ 
                user: req.user._id, 
                status: "Accepted" 
            }).distinct("problem");
            
            const solvedProblemIdStrings = solvedProblemIds.map(id => id.toString());
            
            problems.forEach(p => {
                p.isSolved = solvedProblemIdStrings.includes(p._id.toString());
            });
        }
        
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

        // Check visibility access
        const hasAccess = await canUserAccessProblem(problem, req.user);
        if (!hasAccess) {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. You do not have permission to view this problem." 
            });
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
