const path = require("path");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// LOCAL MODULES - Routes
const questionRouter = require("./routes/questionRoutes");
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
const companyRouter = require("./routes/company.route");
const jobBoardRouter = require("./routes/job.route");
const applicationRouter = require("./routes/application.route");
const codingProblemRouter = require("./routes/codingProblem.route");
const executionRouter = require("./routes/execution.route");
const errorsController = require("./controllers/errors");

// FATAL STARTUP VALIDATION
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("FATAL ERROR: JWT_SECRET is missing. Server cannot start.");
  process.exit(1);
}

const app = express();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://inter-view-swart.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Minimal logging to keep console clean
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ROUTES
app.use("/ping", (req, res) => res.send("PONG"));

// Company & Job Board Core
app.use("/company", companyRouter);
app.use("/job", jobBoardRouter);
app.use("/application", applicationRouter);
app.use("/user", userRouter);

// Interview & Platform Features
app.use("/auth", authRoutes);
app.use("/questions", questionRouter);
app.use("/interview", reportRouter);
app.use("/youtube", youtubeRouter);
app.use("/admin", adminRouter);
app.use("/dashboard", dashboardRouter);
app.use("/leaderboard", leaderboardRoutes);
app.use("/resume", resumeAnalyzerRoutes);
app.use("/job-tracker", jobTrackerRoutes);
app.use("/chat", chatRouter);
app.use("/coding-problems", codingProblemRouter);
app.use("/execute", executionRouter);

// ERROR HANDLING
app.use(errorsController.pageNotFound);

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
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
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });