const Contest = require("../models/contest.model");
const Assessment = require("../models/assessment.model");
const Application = require("../models/application");

/**
 * Checks if a user can access a specific coding problem.
 * 
 * Rules:
 * 1. Admin: Always true.
 * 2. Recruiter: True if ownerId === user._id or visibilityStatus === 'public'.
 * 3. Candidate/Public:
 *    - If public: True.
 *    - If contest: True if within contest time window.
 *    - If private: True if taking an active assessment that includes this question.
 */
const canUserAccessProblem = async (problem, user) => {
    if (!user) return problem.visibilityStatus === 'public';
    
    const role = (user.userType || "").toLowerCase().trim();
    
    // 1. Admin has full access
    if (role === 'admin') return true;

    // 2. Recruiter access
    if (role === 'recruiter') {
        if (problem.visibilityStatus === 'public') return true;
        // Check if recruiter owns the private question
        return problem.ownerId && problem.ownerId.toString() === user._id.toString();
    }

    // 3. Candidate / Public access
    if (problem.visibilityStatus === 'public') return true;

    const now = new Date();

    if (problem.visibilityStatus === 'contest') {
        // Find if this problem belongs to any active contest
        const activeContest = await Contest.findOne({
            questions: problem._id,
            startTime: { $lte: now },
            endTime: { $gte: now }
        });
        return !!activeContest;
    }

    if (problem.visibilityStatus === 'private') {
        // Find if this problem belongs to an assessment the user is allowed to take
        const assessment = await Assessment.findOne({
            "questions.questionId": problem._id,
            startTime: { $lte: now },
            endTime: { $gte: now },
            visibility: 'active'
        });

        if (assessment) {
            // Check if candidate has an application for this job
            const application = await Application.findOne({
                job: assessment.job,
                applicant: user._id
            });
            return !!application;
        }
    }

    return false;
};

module.exports = {
    canUserAccessProblem
};
