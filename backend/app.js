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

const userRouter = require("./routes/userRoutes");
const reportRouter = require("./routes/reportRoutes");
const youtubeRouter = require("./routes/youtubeRoutes");
const adminRouter = require("./routes/adminRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
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
    origin: "*", // Allow all origins (standard for public/development APIs)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
); // CORS should also run before the routers

const companyRouter = require("./routes/company.route");
const jobBoardRouter = require("./routes/job.route");
const applicationRouter = require("./routes/application.route");

app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/interview", reportRouter);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/youtube", youtubeRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/resume", resumeAnalyzerRoutes);
app.use("/api/v1/job-tracker", jobTrackerRoutes);

// Job Board Routes
app.use("/api/v1/user", userRouter); // Alias for Job Board Auth
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", jobBoardRouter);
app.use("/api/v1/application", applicationRouter);

app.use(errorsController.pageNotFound);

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
