//backend\routes\userRoutes.js
const express = require("express");
const userRouter = express.Router();
const authController = require("../controllers/authController");

// ==================== AUTH ROUTES ====================

// Signup route (with validation)
userRouter.post("/signup", authController.signup);

// Login route
userRouter.post("/login", authController.login);

// Google Login route
userRouter.post("/google-login", authController.googleLogin);

// Logout route
userRouter.post("/logout", authController.logout);

// Update route (Private)
const { protect } = require("../middleware/authMiddleware");
const { singleUpload, multiUpload } = require("../middleware/multer");

userRouter.put("/update", protect, multiUpload, authController.updateProfile);

userRouter.post("/set-password", protect, authController.setPassword);
userRouter.post("/change-password", protect, authController.changePassword);

// Job board routes
userRouter.post("/register", singleUpload, authController.register);
userRouter.post("/profile/update", protect, multiUpload, authController.updateProfile);

userRouter.get("/company-members", protect, authController.getCompanyMembers);
module.exports = userRouter;
