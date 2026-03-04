//backend\controllers\leaderboardController.js
const User = require("../models/user");
const Report = require("../models/reportModel");

// @desc    Get Global Leaderboard
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // 1. Fetch total count for pagination
    const totalUsers = await User.countDocuments({ userType: "candidate" });
    const totalPages = Math.ceil(totalUsers / limit);

    // 2. Fetch paginated, sorted users directly from indexed DB
    const rankedCandidates = await User.find({ userType: "candidate" })
      .select("_id userName email profileUrl rating")
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 3. Assign Rank based on their global position (skip + index)
    const leaderboardData = rankedCandidates.map((c, index) => ({
      ...c,
      rank: skip + index + 1,
    }));

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardData,
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
      },
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching leaderboard" });
  }
};

module.exports = {
  getLeaderboard
};
