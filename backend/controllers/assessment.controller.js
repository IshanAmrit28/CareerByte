const Assessment = require("../models/assessment.model");
const CodingProblem = require("../models/codingProblem.js");
const Application = require("../models/application.js");
const Job = require("../models/job.js");

// Helper to calculate weighted points based on difficulty (case-insensitive)
const calculateWeightedScore = (problemDifficulty, points) => {
    const diff = (problemDifficulty || 'Medium').toLowerCase();
    const weights = { 'easy': 1, 'medium': 2, 'hard': 3 };
    const weight = weights[diff] || 1;
    return points * weight;
};

exports.createAssessment = async (req, res) => {
    try {
        const { jobId, questions, duration } = req.body;
        
        // Robustly format questions array
        const formattedQuestions = await Promise.all((questions || []).map(async (q) => {
            const problemId = q.questionId || q;
            const problem = await CodingProblem.findById(problemId);
            return {
                questionId: problemId,
                difficulty: q.difficulty || problem?.difficulty || 'Medium',
                score: q.score || 0
            };
        }));

        const assessment = await Assessment.create({
            job: jobId,
            questions: formattedQuestions,
            duration,
            recruiter: req.id
        });

        // Ensure all questions in the assessment are private and owned by the recruiter
        await CodingProblem.updateMany(
            { _id: { $in: questions } },
            { visibilityStatus: 'private', ownerId: req.id }
        );

        res.status(201).json({
            success: true,
            message: "Assessment created successfully",
            assessment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getRecruiterAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({ recruiter: req.id }).populate('job').populate('questions');
        res.status(200).json({
            success: true,
            assessments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getAssessmentForCandidate = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await Assessment.findById(assessmentId).populate('questions.questionId', 'title description difficulty tags');
        
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Check if candidate has applied for the job
        const application = await Application.findOne({ 
            job: assessment.job, 
            applicant: req.id 
        });

        if (!application) {
            return res.status(403).json({
                success: false,
                message: "You must apply for this job to take the assessment"
            });
        }

        // Check if 24h window is open
        const now = new Date();
        if (assessment.startTime && now < assessment.startTime) {
            return res.status(403).json({
                success: false,
                message: "Assessment window hasn't opened yet"
            });
        }
        if (assessment.endTime && now > assessment.endTime) {
            return res.status(403).json({
                success: false,
                message: "Assessment window has closed"
            });
        }

        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        const attempt = await CodingAssessmentReport.findOne({ assessment: assessmentId, candidate: req.id });

        if (attempt && (attempt.status === 'completed' || attempt.status === 'submitted')) {
            return res.status(403).json({
                success: false,
                message: "You have already submitted this assessment"
            });
        }

        res.status(200).json({
            success: true,
            assessment,
            startTime: attempt ? attempt.startTime : null,
            attempt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.openAssessmentWindow = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

        const assessment = await Assessment.findByIdAndUpdate(assessmentId, {
            startTime,
            endTime,
            visibility: 'active'
        }, { new: true });

        res.status(200).json({
            success: true,
            message: "Assessment window opened for 24 hours",
            assessment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        const { assessmentId, submissions } = req.body; // submissions: [{ problemId, code, passedCases, totalCases }]
        const candidateId = req.id;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

        // Calculate the true maximum possible score from ALL questions in the assessment
        let trueMaxScore = 0;
        for (const q of assessment.questions) {
            const difficulty = q.difficulty || 'Medium';
            // Each question is worth 100% of its category weight (cases * weight)
            // But here we need to know the total cases per question. 
            // The user defined 15, 30, 45 as base max points for Easy, Medium, Hard.
            const basePoints = 15; // Assuming each question has 15 base points as standard in this system
            trueMaxScore += calculateWeightedScore(difficulty, basePoints);
        }

        // Process submissions, ensuring only the latest code for each problem is kept
        const uniqueSubmissions = new Map();
        for (const sub of submissions) {
            const problemId = sub.problemId?.toString();
            if (!problemId) continue;
            
            const assessmentQuestion = assessment.questions.find(q => {
                const qId = q.questionId?._id ? q.questionId._id.toString() : q.questionId?.toString();
                return qId === problemId;
            });
            const difficulty = assessmentQuestion?.difficulty || 'Medium';
            const weightedScore = calculateWeightedScore(difficulty, sub.passedCases || 0);
            const weightedTotal = calculateWeightedScore(difficulty, sub.totalCases || 0);

            uniqueSubmissions.set(problemId, {
                problem: sub.problemId,
                code: sub.code,
                language: sub.language,
                score: sub.passedCases || 0, // Store raw passed cases
                totalTestCases: sub.totalCases || 0, // Store raw total cases
                weightedScore: weightedScore, // Optionally store weighted for internal tracking if schema allowed, but we'll stick to raw for display
                weightedTotal: weightedTotal
            });
        }

        const submissionDocs = Array.from(uniqueSubmissions.values()).map(s => ({
            problem: s.problem,
            code: s.code,
            language: s.language,
            score: s.score, // RAW
            totalTestCases: s.totalTestCases, // RAW
            weightedScore: s.weightedScore,
            weightedTotal: s.weightedTotal
        }));
        
        // Calculate totalScore using the weighted values we calculated during processing
        totalScore = Array.from(uniqueSubmissions.values()).reduce((acc, s) => acc + (s.weightedScore || 0), 0);

        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        const report = await CodingAssessmentReport.findOneAndUpdate(
            { assessment: assessmentId, candidate: candidateId },
            {
                submissions: submissionDocs,
                totalScore,
                maxPossibleScore: trueMaxScore, // Use the calculated assessment max
                submitTime: new Date(),
                status: 'completed'
            },
            { new: true, upsert: true }
        );

        // Update Application with scores and eligibility based on TRUE max score
        const assessmentPercentage = trueMaxScore > 0 ? (totalScore / trueMaxScore) * 100 : 0;
        const job = await Job.findById(assessment.job);
        
        let interviewStatus = 'locked';
        // Unlock if score threshold is met (75%)
        if (assessmentPercentage >= 75) {
            interviewStatus = 'eligible';
        }
        
        console.log(`[ASSESSMENT_SUBMIT] Candidate: ${candidateId}, Percentage: ${assessmentPercentage}%, Final Status: ${interviewStatus}`);

        // Calculate interview expiry: 24 hours after assessment.endTime
        const interviewExpiresAt = assessment.endTime ? new Date(new Date(assessment.endTime).getTime() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

        await Application.findOneAndUpdate(
            { job: assessment.job, applicant: candidateId },
            {
                assessmentScore: totalScore,
                assessmentPercentage,
                interviewStatus,
                interviewExpiresAt
            }
        );

        res.status(201).json({
            success: true,
            message: "Assessment submitted successfully",
            report
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.submitProblem = async (req, res) => {
    try {
        const { assessmentId, problemId, code, language, score, totalTestCases } = req.body;
        const candidateId = req.id;

        const assessment = await Assessment.findById(assessmentId).populate('questions.questionId');
        if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

        const assessmentQuestion = assessment.questions.find(q => {
            const qId = q.questionId?._id ? q.questionId._id.toString() : q.questionId?.toString();
            return qId === problemId?.toString();
        });
        const difficulty = assessmentQuestion?.difficulty || assessmentQuestion?.questionId?.difficulty || 'Medium';
        console.log(`[SUBMIT_PROBLEM] Problem: ${problemId}, Found Difficulty: ${difficulty}, Raw Score: ${score}`);

        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        let report = await CodingAssessmentReport.findOne({ assessment: assessmentId, candidate: candidateId });

        if (!report) {
            report = new CodingAssessmentReport({
                assessment: assessmentId,
                candidate: candidateId,
                startTime: new Date(),
                status: 'in-progress',
                submissions: []
            });
        }

        const weightedScore = calculateWeightedScore(difficulty, score);
        const weightedTotal = calculateWeightedScore(difficulty, totalTestCases);

        // Update or add the submission for this problem
        const existingSubIndex = report.submissions.findIndex(s => s.problem?.toString() === problemId?.toString());
        
        const newSubmission = {
            problem: problemId,
            code,
            language,
            score: score, // Store RAW passed cases
            totalTestCases: totalTestCases, // Store RAW total cases
            weightedScore: weightedScore, // Helper for recalculation
            weightedTotal: weightedTotal
        };

        if (existingSubIndex > -1) {
            report.submissions[existingSubIndex] = newSubmission;
        } else {
            report.submissions.push(newSubmission);
        }

        // Recalculate total scores based on assessment's true potential if possible
        // but for problem save, we just update the progress report.
        // Recalculate total scores based on weighted values
        report.totalScore = report.submissions.reduce((acc, s) => {
            // If weightedScore isn't in DB yet (saved from previous versions), 
            // we might need to recalculate it here, but since we are updating now:
            return acc + (s.weightedScore || 0);
        }, 0);
        
        // For 'in-progress' reports, we still track maxPossibleScore based on all questions in assessment
        let assessmentMaxScore = 0;
        for (const q of assessment.questions) {
            const difficulty = q.difficulty || 'Medium';
            assessmentMaxScore += calculateWeightedScore(difficulty, 15); // Consistent with submitAssessment
        }
        report.maxPossibleScore = assessmentMaxScore;

        await report.save();

        res.status(200).json({
            success: true,
            message: "Problem progress saved",
            report
        });
    } catch (error) {
        console.error("[ASSESSMENT] Submit problem error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getAssessmentReports = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        
        // Fetch assessment to get the associated job ID
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        const reports = await CodingAssessmentReport.find({ assessment: assessmentId })
            .populate('candidate', 'userName email profile')
            .populate('submissions.problem', 'title')
            .sort({ totalScore: -1 });

        // Link with applications and ensure all assessment questions are represented
        const reportsWithStatus = await Promise.all(reports.map(async (report) => {
            const reportObj = report.toObject();
            
            // Map existing submissions by problem ID for easy lookup
            const submissionMap = new Map(report.submissions.map(s => [s.problem?._id?.toString() || s.problem?.toString(), s]));
            
            // Create a full list of submissions based on assessment questions
            const fullSubmissions = assessment.questions.map(q => {
                const qId = q.questionId?._id ? q.questionId._id.toString() : q.questionId?.toString();
                const existingSub = submissionMap.get(qId);
                
                if (existingSub) {
                    return existingSub;
                } else {
                    // Return a "ghost" submission for unsubmitted problems
                    return {
                        problem: q.questionId,
                        code: null,
                        language: null,
                        score: 0,
                        totalTestCases: 15, // Default/Assumed total for unattempted
                        isNotSubmitted: true
                    };
                }
            });

            reportObj.submissions = fullSubmissions;

            const application = await Application.findOne({
                job: assessment.job,
                applicant: report.candidate._id
            });
            
            if (application) {
                reportObj.applicationId = application._id;
                reportObj.applicationStatus = application.status;
                reportObj.interviewReportId = application.interviewReportId;
                reportObj.interviewStatus = application.interviewStatus;
                reportObj.interviewScore = application.interviewScore || 0;
            }
            return reportObj;
        }));

        res.status(200).json({
            success: true,
            reports: reportsWithStatus
        });
    } catch (error) {
        console.error("[ASSESSMENT] Fetch reports error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

exports.startAssessmentAttempt = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const userId = req.id;

        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        let report = await CodingAssessmentReport.findOne({ assessment: assessmentId, candidate: userId });

        if (!report) {
            report = await CodingAssessmentReport.create({
                assessment: assessmentId,
                candidate: userId,
                startTime: new Date(),
                status: 'in-progress'
            });
        }

        res.status(200).json({
            success: true,
            message: "Assessment attempt started",
            startTime: report.startTime
        });
    } catch (error) {
        console.error("[ASSESSMENT] Start attempt error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await Assessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({ success: false, message: "Assessment not found" });
        }

        // Verify that the recruiter deleting it is the one who created it
        if (assessment.recruiter.toString() !== req.id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied. You can only delete your own assessments." });
        }

        await Assessment.findByIdAndDelete(assessmentId);

        res.status(200).json({
            success: true,
            message: "Assessment deleted successfully"
        });
    } catch (error) {
        console.error("[ASSESSMENT] Delete error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
