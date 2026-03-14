const Contest = require("../models/contest.model");
const CodingProblem = require("../models/codingProblem.js");
const ContestRanking = require("../models/contestRanking.model");
const UserContestRating = require("../models/userContestRating.model");
const User = require("../models/user");
const Submission = require("../models/submission");

const { performVisibilityCleanup } = require("../utils/cleanupTask");

exports.createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, questions } = req.body;
        
        if (!title || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, startTime, or endTime"
            });
        }

        const contest = new Contest({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            questions: questions || [],
            createdBy: req.id || req.user?._id
        });
        await contest.save();

        // Update question visibility status to 'contest'
        if (questions && Array.isArray(questions) && questions.length > 0) {
            await CodingProblem.updateMany(
                { _id: { $in: questions } },
                { visibilityStatus: 'contest' }
            );
        }

        res.status(201).json({
            success: true,
            message: "Contest created successfully",
            contest
        });
    } catch (error) {
        console.error("CONTEST_CREATE_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getAllContests = async (req, res) => {
    try {
        await performVisibilityCleanup();
        const contests = await Contest.find().populate('questions', 'title difficulty tags');
        res.status(200).json({
            success: true,
            contests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getVisibleContests = async (req, res) => {
    try {
        await performVisibilityCleanup();
        // Only return contests that have started or are upcoming
        // For candidates, we might want to hide questions until start time
        const now = new Date();
        const contests = await Contest.find({}).populate('questions', 'title difficulty tags');

        res.status(200).json({
            success: true,
            contests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('questions');
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        const now = new Date();
        // If contest hasn't started, don't show questions to non-admins
        if (now < contest.startTime && req.role !== 'admin') {
            const contestData = contest.toObject();
            delete contestData.questions;
            return res.status(200).json({
                success: true,
                contest: contestData,
                message: "Contest hasn't started yet. Questions are hidden."
            });
        }

        res.status(200).json({
            success: true,
            contest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        // Update question visibility status to 'contest' if questions were provided
        if (req.body.questions && Array.isArray(req.body.questions) && req.body.questions.length > 0) {
            await CodingProblem.updateMany(
                { _id: { $in: req.body.questions } },
                { visibilityStatus: 'contest' }
            );
        }

        res.status(200).json({
            success: true,
            message: "Contest updated successfully",
            contest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Contest deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getContestRankings = async (req, res) => {
    try {
        const rankings = await ContestRanking.find({ contest: req.params.id })
            .populate('user', 'userName profile')
            .sort({ totalPoints: -1, totalTime: 1 });

        res.status(200).json({
            success: true,
            rankings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getMyContestSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ 
            contest: req.params.id, 
            user: req.id || req.user?._id
        }).populate('problem', 'title');

        res.status(200).json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.internalFinalizeContest = async (contestId, alpha = 1) => {
    const contest = await Contest.findById(contestId);
    if (!contest) throw new Error("Contest not found");
    if (contest.isFinalized) return { success: true, message: "Contest already finalized" };

    // Get all rankings for this contest
    const rankings = await ContestRanking.find({ contest: contest._id })
        .sort({ totalPoints: -1, totalTime: 1 });

    if (rankings.length > 0) {
        const totalParticipants = rankings.length;

        // Calculate and save ratings for each participant
        const ratingPromises = rankings.map(async (rankData, index) => {
            const rank = index + 1;
            const rating = 1000 * Math.pow((totalParticipants - rank + 1) / totalParticipants, alpha);

            // Save per-contest rating
            await UserContestRating.findOneAndUpdate(
                { user: rankData.user, contest: contest._id },
                { rank, rating, totalParticipants },
                { upsert: true, new: true }
            );

            // Update user's global rating
            const userRatings = await UserContestRating.find({ user: rankData.user });
            const totalRatingSum = userRatings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatingSum / userRatings.length;

            await User.findByIdAndUpdate(rankData.user, { rating: averageRating });
        });

        await Promise.all(ratingPromises);
    }

    // Make all questions public
    if (contest.questions && contest.questions.length > 0) {
        await CodingProblem.updateMany(
            { _id: { $in: contest.questions }, visibilityStatus: 'contest' },
            { visibilityStatus: 'public' }
        );
        console.log(`[CONTEST] Questions from contest "${contest.title}" are now public.`);
    }

    // Mark contest as finalized
    contest.isFinalized = true;
    await contest.save();

    return { success: true, message: "Contest finalized and ratings updated" };
};

exports.finalizeContest = async (req, res) => {
    try {
        const result = await exports.internalFinalizeContest(req.params.id, req.body.alpha);
        res.status(200).json(result);
    } catch (error) {
        console.error("FINALIZE_CONTEST_ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};
