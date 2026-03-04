//backend\routes\userRoutes.js
const express = require("express");
const userRouter = express.Router();
const authController = require("../controllers/authController");

// ==================== AUTH ROUTES ====================

// Signup route (with validation)
userRouter.post("/signup", authController.signup);

// Login route
userRouter.post("/login", authController.login);

// Logout route
userRouter.post("/logout", authController.logout);

// Update route (Private)
const { protect } = require("../middleware/authMiddleware");
const { singleUpload } = require("../middleware/multer");

userRouter.put("/update", protect, singleUpload, authController.updateProfile);

// Job board routes
userRouter.post("/register", singleUpload, authController.register);
userRouter.post("/profile/update", protect, singleUpload, authController.updateProfile);

module.exports = userRouter;
