const express = require("express");
const authRoutes = express.Router();
const authController = require("../controllers/authController");

// ==================== AUTH ROUTES ====================

// Signup route (with validation)
authRoutes.post("/signup", authController.signup);

// Login route
authRoutes.post("/login", authController.login);

// Logout route
authRoutes.post("/logout", authController.logout);

// Profile route
const { protect } = require("../middleware/authMiddleware");
authRoutes.get("/profile", protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

module.exports = authRoutes;
