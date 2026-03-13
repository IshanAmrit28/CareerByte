const Report = require("../models/reportModel");
const User = require("../models/user");
const UserContestRating = require("../models/userContestRating.model");
const Submission = require("../models/submission");
const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
const Job = require("../models/job");
const Application = require("../models/application");
const Assessment = require("../models/assessment.model");

// Helper to get YYYY-MM-DD from a Date object in local time
const formatDateYMD = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Compute a strictly Codeforces-style user rating based on chronological reports
const computeUserRating = (reports) => {
  let currentRating = 1000; // Base rating for all users

  if (!reports || reports.length === 0) return currentRating;

  // Ensure chronological order
  const sortedReports = [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedReports.forEach((report) => {
    // Treat overallScore not as a flat rating, but as performance percentage (0 to 100)
    let score = report.reportStructure?.overallScore || 0;
    
    // Performance generates a 'delta' (+ or -) based on 60% average.
    let delta = (score - 60);

    // Apply a simple scaling factor so it's not overly volatile
    delta = delta * 0.5;
    
    // Factor in ResumeScore as a small flat modifier to the delta (Max +/- 5)
    if (report.reportStructure?.ResumeScore) {
       const resumeModifier = (report.reportStructure.ResumeScore - 50) / 10;
       delta += resumeModifier;
    }

    // Apply delta
    currentRating += Math.round(delta);
    
    // Floor the rating to never drop below 800 just to keep users engaged
    if (currentRating < 0) currentRating = 0;
  });

  return currentRating;
};

const getGlobalRankings = async () => {
    // 1. Fetch all candidates sorted by their persistent rating
    const users = await User.find({ 
        userType: "candidate",
        rating: { $gt: 0 } // Only rank users who have completed at least one contest
      })
      .select("_id userName email rating profile")
      .sort({ rating: -1 })
      .lean();
    
    // 2. Map to the simplified ranking structure
    return users.map(user => ({
        userId: user._id, 
        userName: user.userName,
        email: user.email ? user.email.toLowerCase() : "",
        rating: user.rating,
        profilePhoto: user.profile ? user.profile.profilePhoto : ""
    }));
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch all reports for the user
    const reports = await Report.find({ candidateId: userId }).sort({ createdAt: 1 });
    
    // Fetch contest rating history
    const contestHistory = await UserContestRating.find({ user: userId })
        .populate('contest', 'title')
        .sort({ createdAt: 1 });
    
    // Calculate global rankings
    const allRankings = await getGlobalRankings();
    const totalRankedUsers = allRankings.length;
    
    const currentUser = await User.findById(userId);
    const userEmailLower = currentUser.email ? currentUser.email.toLowerCase() : "";

    // Find current user's rank by matching email
    const userRankIndex = allRankings.findIndex(r => r.email === userEmailLower);
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : 0;
    const rating = userRankIndex !== -1 ? allRankings[userRankIndex].rating : 0;
    const percentile = totalRankedUsers > 1 && rank > 0
        ? Math.round(((totalRankedUsers - rank) / (totalRankedUsers - 1)) * 100) 
        : (rank === 1 ? 100 : 0);

    // Format Heatmap Data (Aggregate activity from multiple sources)
    const heatmapDataMap = {};
    
    // 1. Interview Reports
    reports.forEach(report => {
        const dateStr = formatDateYMD(report.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });

    // 2. Normal Coding & Contest Submissions (Status: Accepted)
    const acceptedSubmissions = await Submission.find({ user: userId, status: "Accepted" });
    acceptedSubmissions.forEach(sub => {
        const dateStr = formatDateYMD(sub.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });

    // 3. Coding Assessments
    const assessments = await CodingAssessmentReport.find({ candidate: userId, status: "completed" });
    assessments.forEach(ass => {
        const dateStr = formatDateYMD(ass.submitTime || ass.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });
    
    const heatmapMapList = Object.keys(heatmapDataMap).map(date => ({
        date: date,
        count: heatmapDataMap[date]
    }));

    // Collect raw activity timestamps for frontend to handle local timezone bucketing
    const activityDates = [
        ...reports.map(r => r.createdAt),
        ...acceptedSubmissions.map(s => s.createdAt),
        ...assessments.map(a => a.submitTime || a.createdAt)
    ];

    // Aggregate Sector Scores
    let totalCoding = 0;
    let totalTechnical = 0;
    let totalHR = 0;
    let reportCount = reports.length;
    let sectorScores = [];

    if (reportCount > 0) {
        reports.forEach(r => {
            const structure = r.reportStructure || {};
            
            // Coding = ALGORITHM
            const codingScore = structure['ALGORITHM'] ? structure['ALGORITHM'].reduce((acc, q) => acc + (q.aiScore || 0), 0) / Math.max(1, structure['ALGORITHM'].length) : 0;
            
            // Technical = DBMS + OS + CN + OOP
            let techTotal = 0;
            let techCount = 0;
            ['DBMS', 'OS', 'CN', 'OOP'].forEach(subj => {
                if (structure[subj]) {
                    techTotal += structure[subj].reduce((acc, q) => acc + (q.aiScore || 0), 0);
                    techCount += structure[subj].length;
                }
            });
            const technicalScore = techCount > 0 ? techTotal / techCount : 0;

            const hrScore = structure['resumeBasedQuestions'] ? structure['resumeBasedQuestions'].reduce((acc, q) => acc + (q.aiScore || 0), 0) / Math.max(1, structure['resumeBasedQuestions'].length) : (structure['overallScore'] || 0);

            // Scores from the backend might be out of 10 or 100 depending on generation,
            // Adjusting based on standard overall score which is out of 100
            
            totalCoding += codingScore;
            totalTechnical += technicalScore;
            totalHR += hrScore;
        });

        // Determine multiplier. If section scores are tiny (like 0-10), scale them to 100.
        // Let's rely on standard logic where aiScore mapping is known, assuming out of 100 or fractional.
        
        sectorScores = [
            { subject: 'Coding', score: Math.round(totalCoding / reportCount), fullMark: 100 },
            { subject: 'Technical', score: Math.round(totalTechnical / reportCount), fullMark: 100 },
            { subject: 'HR/Cultural', score: Math.round(totalHR / reportCount), fullMark: 100 }
        ];
    }
    
    // Fallback if sector scores appear out of 10 (scaling to 100)
    sectorScores = sectorScores.map(s => {
        if(s.score > 0 && s.score <= 10) return { ...s, score: s.score * 10 };
        return s;
    });

    res.status(200).json({
      success: true,
      data: {
        profileData: {
            rating,
            rank,
            totalRankedUsers,
            percentile,
            bio: currentUser.profile?.bio || "",
            resume: currentUser.profile?.resume || "",
            resumeOriginalName: currentUser.profile?.resumeOriginalName || ""
        },
        heatmapData: heatmapMapList,
        activityDates,
        sectorScores,
        reports: reports.map(r => ({
            ...r.toObject(),
            overallScore: r.reportStructure?.overallScore || 0
        })),
        contestHistory: contestHistory.map(ch => ({
            ...ch.toObject(),
            date: ch.createdAt,
            rating: ch.rating,
            contestTitle: ch.contest?.title
        })),
        isUnrated: (rating || 0) === 0
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get public profile data by User ID
// @access  Private (Authenticated users can view others' profiles)
exports.getPublicProfile = async (req, res) => {
  console.log(`[DEBUG] getPublicProfile entered for userId: ${req.params.id}`);
  try {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    // Check if models are loaded
    if (!User || !Report || !Submission || !CodingAssessmentReport || !UserContestRating) {
        console.error("[DEBUG] One or more models are not defined!", {
            User: !!User,
            Report: !!Report,
            Submission: !!Submission,
            CodingAssessmentReport: !!CodingAssessmentReport,
            UserContestRating: !!UserContestRating
        });
        throw new Error("One or more required models are missing in dashboardController");
    }

    // Check if user exists and is a candidate
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[DEBUG] User not found for ID: ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.userType !== 'candidate') {
      console.log(`[DEBUG] User is not a candidate: ${user.userType}`);
      return res.status(404).json({ success: false, message: "Candidate profile not found" });
    }

    // Fetch all required data
    console.log("[DEBUG] Fetching dashboard data components...");
    const [reports, contestHistory, acceptedSubmissions, assessments] = await Promise.all([
        Report.find({ candidateId: userId }).sort({ createdAt: 1 }),
        UserContestRating.find({ user: userId }).populate('contest', 'title').sort({ createdAt: 1 }),
        Submission.find({ user: userId, status: "Accepted" }),
        CodingAssessmentReport.find({ candidate: userId, status: "completed" })
    ]);
    console.log(`[DEBUG] Data fetched: reports(${reports.length}), contests(${contestHistory.length}), subs(${acceptedSubmissions.length}), assessments(${assessments.length})`);
    
    // Calculate global rankings
    const allRankings = await getGlobalRankings();
    const totalRankedUsers = allRankings.length;
    
    const userRankIndex = allRankings.findIndex(r => r.userId && r.userId.toString() === userId.toString());
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : 0;
    const rating = userRankIndex !== -1 ? allRankings[userRankIndex].rating : 0;
    const percentile = totalRankedUsers > 1 && rank > 0
        ? Math.round(((totalRankedUsers - rank) / (totalRankedUsers - 1)) * 100) 
        : (rank === 1 ? 100 : 0);

    // Format Heatmap Data
    const heatmapDataMap = {};
    reports.forEach(r => {
        const dateStr = formatDateYMD(r.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });
    acceptedSubmissions.forEach(s => {
        const dateStr = formatDateYMD(s.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });
    assessments.forEach(a => {
        const dateStr = formatDateYMD(a.submitTime || a.createdAt);
        if (dateStr) heatmapDataMap[dateStr] = (heatmapDataMap[dateStr] || 0) + 1;
    });
    
    const heatmapMapList = Object.keys(heatmapDataMap).map(date => ({
        date,
        count: heatmapDataMap[date]
    }));

    // Collect activity dates
    const activityDates = [
        ...reports.map(r => r.createdAt),
        ...acceptedSubmissions.map(s => s.createdAt),
        ...assessments.map(a => a.submitTime || a.createdAt)
    ].filter(Boolean); // Filter out any null/undefined dates

    // Aggregate Sector Scores
    let totalCoding = 0;
    let totalTechnical = 0;
    let totalHR = 0;
    const reportCount = reports.length;
    let sectorScores = [];

    if (reportCount > 0) {
        reports.forEach(r => {
            const structure = r.reportStructure || {};
            const codingScore = structure['ALGORITHM'] ? structure['ALGORITHM'].reduce((acc, q) => acc + (q.aiScore || 0), 0) / Math.max(1, structure['ALGORITHM'].length) : 0;
            
            let techTotal = 0;
            let techCount = 0;
            ['DBMS', 'OS', 'CN', 'OOP'].forEach(subj => {
                if (structure[subj]) {
                    techTotal += structure[subj].reduce((acc, q) => acc + (q.aiScore || 0), 0);
                    techCount += structure[subj].length;
                }
            });
            const technicalScore = techCount > 0 ? techTotal / techCount : 0;
            const hrScore = structure['resumeBasedQuestions'] ? structure['resumeBasedQuestions'].reduce((acc, q) => acc + (q.aiScore || 0), 0) / Math.max(1, structure['resumeBasedQuestions'].length) : (structure['overallScore'] || 0);
            
            totalCoding += codingScore;
            totalTechnical += technicalScore;
            totalHR += hrScore;
        });
        
        sectorScores = [
            { subject: 'Coding', score: Math.round(totalCoding / reportCount), fullMark: 100 },
            { subject: 'Technical', score: Math.round(totalTechnical / reportCount), fullMark: 100 },
            { subject: 'HR/Cultural', score: Math.round(totalHR / reportCount), fullMark: 100 }
        ];
        
        sectorScores = sectorScores.map(s => {
           if(s.score > 0 && s.score <= 10) return { ...s, score: s.score * 10 };
           return s;
        });
    }

    const responseData = {
        userName: user.userName,
        profilePhoto: user.profile ? user.profile.profilePhoto : "",
        bio: user.profile?.bio || "",
        resume: user.profile?.resume || "",
        resumeOriginalName: user.profile?.resumeOriginalName || "",
        profileData: {
            rating,
            rank,
            totalRankedUsers,
            percentile,
        },
        heatmapData: heatmapMapList,
        activityDates,
        totalInterviews: reportCount,
        contestHistory: contestHistory.map(ch => ({
            ...ch.toObject(),
            date: ch.createdAt,
            rating: ch.rating,
            contestTitle: ch.contest?.title
        })),
        isUnrated: (rating || 0) === 0,
        sectorScores: sectorScores
    };

    console.log("[DEBUG] Sending successful response for public profile");
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Public Profile error stack:", error.stack);
    console.error("Public Profile error message:", error.message);
    res.status(500).json({ 
        success: false, 
        message: "Server error", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

exports.getRecruiterStats = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        // 1. Fetch Job Stats
        const activeJobsCount = await Job.countDocuments({ created_by: recruiterId, status: 'active' });
        const inactiveJobsCount = await Job.countDocuments({ created_by: recruiterId, status: 'inactive' });

        // 2. Fetch Total Applicants (Across all jobs by this recruiter)
        const recruiterJobs = await Job.find({ created_by: recruiterId }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);
        const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });

        // 3. Fetch Assessment Stats
        const activeAssessmentsCount = await Assessment.countDocuments({ recruiter: recruiterId, visibility: 'active' });
        const closedAssessmentsCount = await Assessment.countDocuments({ recruiter: recruiterId, visibility: 'closed' });

        // 4. Candidates who attempted assessments
        const recruiterAssessments = await Assessment.find({ recruiter: recruiterId }).select('_id');
        const assessmentIds = recruiterAssessments.map(a => a._id);
        const reports = await CodingAssessmentReport.find({ assessment: { $in: assessmentIds } });
        
        const totalAttempts = reports.length;
        const completedReports = reports.filter(r => r.status === 'completed' || r.status === 'submitted');
        const countCompleted = completedReports.length;
        
        // 4.1 Success Rate (Score > 60%)
        const successfulReports = completedReports.filter(r => (r.totalScore / (r.maxPossibleScore || 1)) >= 0.6);
        const successRate = totalAttempts > 0 ? Math.round((successfulReports.length / totalAttempts) * 100) : 0;

        // 4.2 Drop-off Rate (Started but not finished)
        const dropOffCount = reports.filter(r => r.status === 'in-progress').length;
        const dropOffRate = totalAttempts > 0 ? Math.round((dropOffCount / totalAttempts) * 100) : 0;

        // 4.3 Average Completion Time (in minutes)
        let totalCompletionTime = 0;
        let validCompletionCount = 0;
        completedReports.forEach(r => {
            if (r.submitTime && r.startTime) {
                const diff = (new Date(r.submitTime) - new Date(r.startTime)) / 60000;
                if (diff > 0) {
                    totalCompletionTime += diff;
                    validCompletionCount++;
                }
            }
        });
        const avgCompletionTime = validCompletionCount > 0 ? Math.round(totalCompletionTime / validCompletionCount) : 0;

        res.status(200).json({
            success: true,
            stats: {
                activeJobs: activeJobsCount,
                inactiveJobs: inactiveJobsCount,
                totalApplicants,
                activeAssessments: activeAssessmentsCount,
                closedAssessments: closedAssessmentsCount,
                candidatesGivenAssessment: countCompleted,
                realtimeMetrics: {
                    successRate,
                    dropOffRate,
                    avgCompletionTime
                }
            }
        });
    } catch (error) {
        console.error("Recruiter Stats error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

