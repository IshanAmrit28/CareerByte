const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId;
        req.user = await User.findById(userId).select("-password");
        req.id = userId;

        if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Normalized role helper to prevent case-sensitivity bugs
const getRole = (user) => (user?.userType || "").toLowerCase().trim();

const isRecruiter = (req, res, next) => {
    if (getRole(req.user) === "recruiter") return next();
    res.status(403).json({ success: false, message: "Access denied. Recruiter only." });
};

const isSuperAdmin = (req, res, next) => {
    if (getRole(req.user) === "admin") return next();
    res.status(403).json({ success: false, message: "Access denied. Admin only." });
};

const isCandidate = (req, res, next) => {
    if (getRole(req.user) === "candidate") return next();
    res.status(403).json({ success: false, message: "Access denied. Candidate only." });
};

const isAdminOrRecruiter = (req, res, next) => {
    const role = getRole(req.user);
    if (role === "admin" || role === "recruiter") return next();
    res.status(403).json({ success: false, message: "Access denied. Requires Admin or Recruiter privileges." });
};

module.exports = { protect, isRecruiter, isSuperAdmin, isCandidate, isAdminOrRecruiter };