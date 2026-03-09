//backend\app.js
// Core Module
const path = require("path");
require("dotenv").config();

// FATAL STARTUP VALIDATION: Prevent token forgery by enforcing JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing or empty. Server cannot start securely.");
  process.exit(1);
}

// External Module
const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
//Local Module

const questionRouter = require("./routes/questionRoutes");
const errorsController = require("./controllers/errors");

const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const reportRouter = require("./routes/reportRoutes");
const youtubeRouter = require("./routes/youtubeRoutes");
const adminRouter = require("./routes/adminRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const chatRouter = require("./routes/chatRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const resumeAnalyzerRoutes = require("./routes/resumeAnalyzerRoutes");
const jobTrackerRoutes = require("./routes/jobTrackerRoutes");

const app = express();

// FIX: Ensure body parsers are executed FIRST to populate req.body
app.use(express.urlencoded({ extended: true })); // Handles application/x-www-form-urlencoded
app.use(express.json()); // Handles application/json (used by Login/Signup)
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://inter-view-swart.vercel.app"], // Allow specific origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
); // CORS should also run before the routers

app.use((req, res, next) => {
  console.log("[GLOBAL LOG]", req.method, req.originalUrl || req.url);
  next();
});

const companyRouter = require("./routes/company.route");
const jobBoardRouter = require("./routes/job.route");
const applicationRouter = require("./routes/application.route");

app.use("/questions", questionRouter);
app.use("/interview", reportRouter);
app.use("/auth", (req, res, next) => { console.log("HIT API V1 AUTH", req.method, req.url); next(); }, authRoutes);
app.use("/youtube", youtubeRouter);
app.use("/admin", adminRouter);
app.use("/dashboard", dashboardRouter);
app.use("/leaderboard", leaderboardRoutes);
app.use("/resume", resumeAnalyzerRoutes);
app.use("/job-tracker", jobTrackerRoutes);
app.use("/chat", chatRouter);

// Job Board Routes
app.use("/user", userRouter); // Alias for Job Board Auth
app.use("/company", companyRouter);
app.use("/job", jobBoardRouter);
app.use("/application", applicationRouter);

app.use(errorsController.pageNotFound);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB using Mongoose");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB with Mongoose", err);
  });
