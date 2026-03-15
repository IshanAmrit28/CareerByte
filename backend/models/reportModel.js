//backend\models\reportModel.js

// Fix: Use require
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
});

const questionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  question: { type: String },
  answer: { type: String, default: "" },
  aiScore: { type: Number, default: null },
});

const reportStructureSchema = new mongoose.Schema({
  INTRO: [questionSchema],
  DBMS: [questionSchema],
  OS: [questionSchema],
  CN: [questionSchema],
  OOP: [questionSchema],
  ALGORITHM: [questionSchema],
  SQL: [questionSchema],
  HR: [questionSchema],
  resumeBasedQuestions: [questionSchema],
  ResumeScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  feedbackOnInterviewAnswers: feedbackSchema,
  feedbackOnResume: feedbackSchema,
  hiringChance: { type: String },
});

const reportSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    role: { type: String },
    jobDescription: { type: String },
    resume: { type: String },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending" 
    },
    retryCount: { type: Number, default: 0 },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      index: true,
      required: function() {
        return this.isCompanyInterview === true;
      }
    },
    isCompanyInterview: {
      type: Boolean,
      default: false,
      index: true
    },
    reportStructure: reportStructureSchema,
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
// Fix: Use module.exports
module.exports = Report;
