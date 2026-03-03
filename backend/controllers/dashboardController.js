const Report = require("../models/reportModel");
const User = require("../models/user");

// Compute a strictly Codeforces-style user rating based on chronological reports
const computeUserRating = (reports) => {
  let currentRating = 0; // Base Elo for a new user

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
    // Aggregate rankings by looking at all users
    const users = await User.find({ userType: "candidate" });
    
    // Group candidates by unique email ID
    const emailGroupMap = {};
    for (const cand of users) {
      if (!cand.email) continue;
      const emailLower = cand.email.toLowerCase();
      if (!emailGroupMap[emailLower]) {
        emailGroupMap[emailLower] = {
           userId: cand._id,
           userName: cand.userName,
           email: emailLower,
           candidateIds: []
        };
      }
      emailGroupMap[emailLower].candidateIds.push(cand._id);
    }
    
    const uniqueCandidates = Object.values(emailGroupMap);
    const rankings = [];

    for (const group of uniqueCandidates) {
        // Fetch reports matching any instance of this linked email
        const reports = await Report.find({ candidateId: { $in: group.candidateIds } });
        const rating = computeUserRating(reports);
        rankings.push({
            userId: group.userId, // Return primary candidate ID
            userName: group.userName,
            email: group.email,    // Send email to match strictly on frontend
            rating: rating
        });
    }

    // Sort descending
    rankings.sort((a, b) => b.rating - a.rating);
    return rankings;
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all reports for the user
    const reports = await Report.find({ candidateId: userId }).sort({ createdAt: 1 });
    
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

    // Format Heatmap Data (Count reports per day)
    const heatmapDataMap = {};
    reports.forEach(report => {
        const dateStr = new Date(report.createdAt).toISOString().split('T')[0];
        if (heatmapDataMap[dateStr]) {
            heatmapDataMap[dateStr]++;
        } else {
            heatmapDataMap[dateStr] = 1;
        }
    });
    
    const heatmapMapList = Object.keys(heatmapDataMap).map(date => ({
        date: date,
        count: heatmapDataMap[date]
    }));

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
        },
        heatmapData: heatmapMapList,
        sectorScores,
        reports
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
  try {
    const userId = req.params.id;
    
    // Check if user exists and is a candidate
    const user = await User.findById(userId);
    if (!user || user.userType !== 'candidate') {
      return res.status(404).json({ success: false, message: "Candidate profile not found" });
    }

    // Fetch all reports for the user
    const reports = await Report.find({ candidateId: userId }).sort({ createdAt: 1 });
    
    // Calculate global rankings
    const allRankings = await getGlobalRankings();
    const totalRankedUsers = allRankings.length;
    
    // Find current user's rank
    const userRankIndex = allRankings.findIndex(r => r.userId.toString() === userId.toString());
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : 0;
    const rating = userRankIndex !== -1 ? allRankings[userRankIndex].rating : 0;
    const percentile = totalRankedUsers > 1 && rank > 0
        ? Math.round(((totalRankedUsers - rank) / (totalRankedUsers - 1)) * 100) 
        : (rank === 1 ? 100 : 0);

    // Format Heatmap Data (Count reports per day)
    const heatmapDataMap = {};
    reports.forEach(report => {
        const dateStr = new Date(report.createdAt).toISOString().split('T')[0];
        if (heatmapDataMap[dateStr]) {
            heatmapDataMap[dateStr]++;
        } else {
            heatmapDataMap[dateStr] = 1;
        }
    });
    
    const heatmapMapList = Object.keys(heatmapDataMap).map(date => ({
        date: date,
        count: heatmapDataMap[date]
    }));

    // Aggregate Sector Scores
    let totalCoding = 0;
    let totalTechnical = 0;
    let totalHR = 0;
    let reportCount = reports.length;
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

    res.status(200).json({
      success: true,
      data: {
        userName: user.userName,
        profileData: {
            rating,
            rank,
            totalRankedUsers,
            percentile,
        },
        heatmapData: heatmapMapList,
        sectorScores,
        totalInterviews: reportCount
        // Explicitly omitting `reports` to hide private interview details on the public profile
      }
    });
  } catch (error) {
    console.error("Public Profile error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
