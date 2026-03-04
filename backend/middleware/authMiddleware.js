//backend\middleware\authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to protect routes (PROTECT remains the same)
const protect = async (req, res, next) => {
  let token; // Check for "Authorization: Bearer <token>" or cookies

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Verify token
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Backward compatibility: jobboard uses userId, main app uses id
      const userId = decoded.id || decoded.userId;

      req.user = await User.findById(userId).select("-password");
      req.id = userId; // To make it compatible with jobboard controllers

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

// NEW: Middleware to check if the authenticated user is a recruiter
const isRecruiter = (req, res, next) => {
  // Check if req.user (attached by 'protect' middleware) exists and has the correct type
  if (req.user && req.user.userType === "recruiter") {
    next();
  } else {
    // Forbidden: 403 status code
    res
      .status(403)
      .json({ message: "Access denied. Requires Recruiter privileges." });
  }
};

// NEW: Middleware to check if the authenticated user is a admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Requires Super Admin privileges." });
  }
};

module.exports = { protect, isRecruiter, isSuperAdmin };
