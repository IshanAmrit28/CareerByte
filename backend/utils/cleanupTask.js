const Contest = require("../models/contest.model");
const Assessment = require("../models/assessment.model");
const CodingProblem = require("../models/codingProblem");

const { internalFinalizeContest } = require("../controllers/contest.controller");

/**
 * Core logic to update visibility status based on ended contests and assessments.
 */
const performVisibilityCleanup = async () => {
    try {
        const now = new Date();
        
        // 1. Finalize Contests (Automated Rating Updates)
        const unfinalizedContests = await Contest.find({
            endTime: { $lt: now },
            isFinalized: { $ne: true }
        });

        for (const contest of unfinalizedContests) {
            try {
                console.log(`[CLEANUP] Automatically finalizing contest: ${contest.title}`);
                await internalFinalizeContest(contest._id);
            } catch (err) {
                console.error(`[CLEANUP] Failed to finalize contest ${contest._id}:`, err);
            }
        }

        // 2. Continuous Visibility Cleanup (JIT and redundacy)
        // Find contests that ended recently to ensure their questions are public
        const endedContests = await Contest.find({
            endTime: { $lt: now }
        });

        for (const contest of endedContests) {
            if (contest.questions && contest.questions.length > 0) {
                const result = await CodingProblem.updateMany(
                    { 
                        _id: { $in: contest.questions },
                        visibilityStatus: 'contest' 
                    },
                    { visibilityStatus: 'public' }
                );
                if (result.modifiedCount > 0) {
                    console.log(`[CLEANUP] Updated ${result.modifiedCount} questions from contest "${contest.title}" to public.`);
                }
            }
        }

        // 2. Cleanup Assessments
        const endedAssessments = await Assessment.find({
            endTime: { $lt: now }
        });

        for (const assessment of endedAssessments) {
            if (assessment.questions && assessment.questions.length > 0) {
                const result = await CodingProblem.updateMany(
                    { 
                        _id: { $in: assessment.questions },
                        visibilityStatus: 'private' 
                    },
                    { visibilityStatus: 'public' }
                );
                if (result.modifiedCount > 0) {
                    console.log(`[CLEANUP] Updated ${result.modifiedCount} questions from assessment for job ID ${assessment.job} to public.`);
                }
            }
        }
    } catch (error) {
        console.error("[CLEANUP] Error in visibility cleanup task:", error);
    }
};

/**
 * Background task to automatically update the visibilityStatus of questions
 * once their associated contest or assessment has ended.
 */
const startCleanupTask = () => {
    console.log("[CLEANUP] Starting visibility cleanup task...");
    
    // Run every 5 minutes
    setInterval(performVisibilityCleanup, 5 * 60 * 1000); 
};

module.exports = {
    startCleanupTask,
    performVisibilityCleanup
};
