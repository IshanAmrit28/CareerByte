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
  aiScore: { type: Number, default: null },
});

const reportStructureSchema = new mongoose.Schema({
  DBMS: [questionSchema],
  OS: [questionSchema],
  CN: [questionSchema],
  OOP: [questionSchema],
  ALGORITHM: [questionSchema],
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
    reportStructure: reportStructureSchema,
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
// Fix: Use module.exports
module.exports = Report;
