// backend\controllers\reportController.js

const fs = require("fs");
const Report = require("../models/reportModel");
const Question = require("../models/questionModel");
const User = require("../models/user");
// ✅ Import the new evaluateAnswers function
// ✅ Import the new evaluateAnswers function
const { processResume, evaluateAnswers, generateInterviewPrompt } = require("../utils/aiProcessor");
// 🟢 Start Interview (Refactored to handle Company Interviews)
exports.startInterview = async (req, res) => {
  try {
    const { role, jobDescription, applicationId, isCompanyInterview } = req.body;
    const candidateId = req.user._id.toString();
    const resumeFile = req.file;

    if (!role || !jobDescription)
      return res.status(400).json({ message: "Missing required fields" });
    if (!resumeFile)
      return res.status(400).json({ message: "Resume file is required" });

    let finalRole = role;
    let finalJobDescription = jobDescription;
    let jobId = null;

    const Application = require("../models/application");
    const Job = require("../models/job");

    if (isCompanyInterview) {
      if (!applicationId) {
        return res.status(400).json({ message: "applicationId is required for company interviews" });
      }
      
      const application = await Application.findById(applicationId).populate('job');
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check eligibility and session status
      if (application.interviewStatus === "completed") {
        return res.status(400).json({ message: "Interview already completed" });
      }
      if (application.interviewStatus === "in_progress") {
        // Allow resuming if not expired
        if (application.interviewExpiresAt && new Date() > application.interviewExpiresAt) {
            return res.status(403).json({ message: "The window for this company technical interview has expired" });
        }
        return res.status(400).json({ message: "Interview already in progress. Please resume existing session." });
      }
      if (application.interviewStatus !== "eligible") {
        return res.status(403).json({ message: "Candidate not eligible for this company interview" });
      }
      if (application.interviewExpiresAt && new Date() > application.interviewExpiresAt) {
        return res.status(403).json({ message: "The window for this company technical interview has expired" });
      }

      jobId = application.job._id;
      finalRole = application.job.title;
      finalJobDescription = application.job.description;

      // Update application status
      application.interviewStatus = "in_progress";
      application.interviewStartedAt = new Date();
      await application.save();
    }

    const fileBuffer = resumeFile.buffer; // --- 1. Fetch DB questions and AI analysis in parallel ---

    const getRandom = (cat, size = 3) =>
      Question.aggregate([
        { $match: { category: cat } },
        { $sample: { size: size } },
      ]);

    const [dbmsQ, osQ, cnQ, oopQ, codeQ, sqlQ, hrQ, aiOutput] = await Promise.all([
      getRandom("DBMS", 3),
      getRandom("OS", 3),
      getRandom("CN", 3),
      getRandom("OOP", 3),
      getRandom("ALGORITHM", 2),
      getRandom("SQL", 2),
      getRandom("HR", 5),
      processResume(fileBuffer, finalJobDescription, finalRole, isCompanyInterview ? {
        jobTitle: finalRole,
        jobDescription: finalJobDescription,
        interviewType: "company"
      } : null),
    ]); // --- 2. Build the Report Structure for the DATABASE ---

    // Define standard HR fallback if DB is empty
    const hrFinal = hrQ.length > 0 ? hrQ : [
        { question: "What are your career goals?" },
        { question: "Why do you want to work for our company?" },
        { question: "What is your greatest professional achievement?" },
        { question: "Describe a difficult work situation and how you handled it." },
        { question: "Where do you see yourself in 5 years?" }
    ];

    const dbReportStructure = {
      INTRO: [{
        question: "Tell me about yourself.",
        aiScore: null
      }],
      DBMS: dbmsQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      OS: osQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      CN: cnQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      OOP: oopQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      ALGORITHM: codeQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      SQL: sqlQ.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      HR: hrFinal.map((q) => ({
        questionId: q._id,
        question: q.question,
        aiScore: null,
      })),
      resumeBasedQuestions: aiOutput.isResume ? aiOutput.questionsData.map((q) => ({
        question: q, // AI questions don't have a questionId
        aiScore: null,
      })) : [], // Return empty array if no resume detected
      ResumeScore: aiOutput.isResume ? aiOutput.scoreData.resumeScore : 0,
      feedbackOnResume: aiOutput.isResume ? aiOutput.scoreData.feedbackOnResume : {
          strengths: ["N/A"],
          weaknesses: ["The uploaded document does not appear to be a valid resume."]
      },
      hiringChance: "",
    }; // --- 3. Save the report to the Database ---

    const report = await Report.create({
      candidateId,
      jobId,
      applicationId,
      isCompanyInterview: !!isCompanyInterview,
      role: finalRole,
      jobDescription: finalJobDescription,
      resume: "stored_in_memory", // Save the path to the resume
      reportStructure: dbReportStructure,
    }); 
    
    if (isCompanyInterview && applicationId) {
      await Application.findByIdAndUpdate(applicationId, { interviewReportId: report._id });
    }

    // --- 4. Build the Report Structure for the CLIENT ---

    const clientReportStructure = {
      INTRO: dbReportStructure.INTRO.map((q) => ({
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      DBMS: dbReportStructure.DBMS.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      OS: dbReportStructure.OS.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      CN: dbReportStructure.CN.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      OOP: dbReportStructure.OOP.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      ALGORITHM: dbReportStructure.ALGORITHM.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      "Resume based question": dbReportStructure.resumeBasedQuestions.map(
        (q) => ({
          question: q.question,
          answer: "",
          aiScore: null,
        })
      ),
      SQL: dbReportStructure.SQL.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
      HR: dbReportStructure.HR.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: "",
        aiScore: null,
      })),
    }; // --- 5. Send the client-specific structure as a response ---

    res.status(201).json({
      message: "Interview started successfully",
      reportId: report._id, // Send the ID
      candidateId: candidateId,
      reportStructure: clientReportStructure,
    });
  } catch (err) {
    console.error("Error starting interview:", err);
    res
      .status(500)
      .json({ message: "Error starting interview", error: err.message });
  }
};// 🔵 End Interview (Refactored for background evaluation)
exports.endInterview = async (req, res) => {
  try {
    const { reportId, reportStructure } = req.body;
    const candidateId = req.user._id.toString();

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Session status check for company interviews
    if (report.isCompanyInterview && report.applicationId) {
        const Application = require("../models/application");
        const application = await Application.findById(report.applicationId);
        if (application && application.interviewStatus !== 'in_progress') {
            return res.status(400).json({ message: "Interview session is not in progress or already completed" });
        }
    }

    // --- 1. Save answers immediately as a precaution ---
    const updateCategoryAnswers = (dbCategory, clientCategory) => {
      if (Array.isArray(dbCategory) && Array.isArray(clientCategory)) {
        dbCategory.forEach((q, index) => {
          if (clientCategory[index]) {
            q.answer = clientCategory[index].answer || "";
          }
        });
      }
    };

    updateCategoryAnswers(report.reportStructure.INTRO, reportStructure.INTRO);
    updateCategoryAnswers(report.reportStructure.DBMS, reportStructure.DBMS);
    updateCategoryAnswers(report.reportStructure.OS, reportStructure.OS);
    updateCategoryAnswers(report.reportStructure.CN, reportStructure.CN);
    updateCategoryAnswers(report.reportStructure.OOP, reportStructure.OOP);
    updateCategoryAnswers(report.reportStructure.ALGORITHM, reportStructure.ALGORITHM);
    updateCategoryAnswers(report.reportStructure.SQL, reportStructure.SQL);
    updateCategoryAnswers(report.reportStructure.HR, reportStructure.HR);
    updateCategoryAnswers(report.reportStructure.resumeBasedQuestions, reportStructure["Resume based question"]);

    report.status = "pending";
    report.markModified("reportStructure");
    await report.save();

    // --- 2. Start background evaluation (Do not await) ---
    evaluateReport(reportId, candidateId).catch(err => 
      console.error(`Background evaluation failed for report ${reportId}:`, err)
    );

    // --- 3. Return immediate success response ---
    res.json({
      message: "Interview ended. Evaluation is processing in the background.",
      reportId: report._id,
      redirectUrl: "/candidate/practice"
    });
  } catch (err) {
    console.error("Error ending interview:", err);
    res.status(500).json({ message: "Error ending interview", error: err.message });
  }
};

// 🔴 Background Evaluation Strategy
const evaluateReport = async (reportId, candidateId) => {
  let report = await Report.findById(reportId);
  if (!report) return;

  try {
    const qaList = [];
    const addToList = (category) => {
      if (Array.isArray(category)) {
        category.forEach((q) => {
          qaList.push({ question: q.question, answer: q.answer || "" });
        });
      }
    };

    addToList(report.reportStructure.INTRO);
    addToList(report.reportStructure.DBMS);
    addToList(report.reportStructure.OS);
    addToList(report.reportStructure.CN);
    addToList(report.reportStructure.OOP);
    addToList(report.reportStructure.ALGORITHM);
    addToList(report.reportStructure.SQL);
    addToList(report.reportStructure.HR);
    addToList(report.reportStructure.resumeBasedQuestions);

    const aiEvaluation = await evaluateAnswers(qaList);
    
    // Normalize string for robust matching
    const normalize = (str) => str?.toLowerCase().trim().replace(/[?.!,]/g, "") || "";

    const scoreMap = new Map(
      aiEvaluation.scores_per_question.map((s) => [normalize(s.question), s.aiScore])
    );

    const updateCategoryScores = (dbCategory) => {
      if (Array.isArray(dbCategory)) {
        dbCategory.forEach((q) => {
          q.aiScore = scoreMap.get(normalize(q.question)) || 0;
          // Clean up answer text after successful evaluation to save space
          q.answer = undefined; 
        });
      }
    };

    updateCategoryScores(report.reportStructure.INTRO);
    updateCategoryScores(report.reportStructure.DBMS);
    updateCategoryScores(report.reportStructure.OS);
    updateCategoryScores(report.reportStructure.CN);
    updateCategoryScores(report.reportStructure.OOP);
    updateCategoryScores(report.reportStructure.ALGORITHM);
    updateCategoryScores(report.reportStructure.SQL);
    updateCategoryScores(report.reportStructure.HR);
    updateCategoryScores(report.reportStructure.resumeBasedQuestions);

    report.reportStructure.overallScore = aiEvaluation.overallScore;
    report.reportStructure.feedbackOnInterviewAnswers = aiEvaluation.feedbackOnInterviewAnswers;
    report.reportStructure.hiringChance = aiEvaluation.hiringChance;
    report.status = "completed";

    report.markModified("reportStructure");
    await report.save();

    // Update Company Application if linked
    if (report.isCompanyInterview && report.applicationId) {
      const Application = require("../models/application");
      await Application.findByIdAndUpdate(report.applicationId, {
        interviewScore: aiEvaluation.overallScore,
        interviewStatus: 'completed'
      });
    }

    // Update User Rating (for mock interviews mostly, but keeping it)
    let delta = (aiEvaluation.overallScore - 60) * 0.5;
    if (report.reportStructure?.ResumeScore) {
       delta += (report.reportStructure.ResumeScore - 50) / 10;
    }
    const roundedDelta = Math.round(delta);

    await User.findByIdAndUpdate(candidateId, {
      $push: { report: report._id },
      $inc: { rating: roundedDelta },
    });
    await User.updateOne({ _id: candidateId, rating: { $lt: 0 } }, { $set: { rating: 0 } });

  } catch (err) {
    console.error(`AI Evaluation Attempt ${report.retryCount + 1} Failed:`, err);
    
    if (report.retryCount < 3) {
      report.retryCount += 1;
      await report.save();
      // Exponential backoff: 30s, 2m, 5m
      const backoff = [30000, 120000, 300000][report.retryCount - 1];
      setTimeout(() => evaluateReport(reportId, candidateId), backoff);
    } else {
      report.status = "failed";
      await report.save();
    }
  }
};

// 🟡 Manual Retry for Evaluation
exports.retryEvaluation = async (req, res) => {
    try {
        const { reportId } = req.params;
        const candidateId = req.user._id.toString();
        const report = await Report.findById(reportId);

        if (!report) return res.status(404).json({ message: "Report not found" });
        if (report.status === "completed") return res.status(400).json({ message: "Already evaluated" });

        report.status = "pending";
        report.retryCount = 0; // Reset retry count for manual retry
        await report.save();

        evaluateReport(reportId, candidateId);
        res.json({ message: "Evaluation restarted" });
    } catch (err) {
        res.status(500).json({ message: "Error retrying evaluation", error: err.message });
    }
};

// 🟣 View Report (Unchanged from previous step)
exports.viewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // --- Strict Authorization ---
    if (report.isCompanyInterview) {
      if (req.user.userType === 'candidate') {
        // Candidates only see submission success, not the report details
        if (report.candidateId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Access denied" });
        }
        return res.json({
          reportId: report._id,
          candidateId: report.candidateId,
          status: report.status,
          message: "Interview submitted successfully. The recruiter will review your application.",
          isRestricted: true // Flag for frontend to show simple success view
        });
      } else if (req.user.userType === 'recruiter') {
        // Recruiters must own the job associated with the report
        const Job = require("../models/job");
        const job = await Job.findById(report.jobId);
        if (!job || job.created_by.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Access denied. You can only view reports for your own jobs." });
        }
      }
    }

    const populateQuestions = async (qs) => {
      if (!qs || qs.length === 0) return [];
      const dbQIds = qs.filter((q) => q.questionId).map((q) => q.questionId); // Fetch the question text for all DB questions
      const dbQuestions = await Question.find({ _id: { $in: dbQIds } });
      const questionMap = new Map(
        dbQuestions.map((q) => [q._id.toString(), q.question])
      );

      const populatedQs = qs.map((q) => {
        if (q.questionId) {
          return {
            questionId: q.questionId,
            question:
              questionMap.get(q.questionId.toString()) || "Question not found",
            aiScore: q.aiScore,
          };
        } // This is an AI question (resumeBased), it already has the question text
        return {
          question: q.question,
          aiScore: q.aiScore,
        };
      });
      return populatedQs;
    }; // Build the response structure

    // Build the response structure
    const reportStructureObj = report.toObject().reportStructure;

    const responseStructure = {
      ...reportStructureObj, 
      DBMS: await populateQuestions(reportStructureObj.DBMS),
      OS: await populateQuestions(reportStructureObj.OS),
      CN: await populateQuestions(reportStructureObj.CN),
      OOP: await populateQuestions(reportStructureObj.OOP),
      ALGORITHM: await populateQuestions(reportStructureObj.ALGORITHM),
      SQL: await populateQuestions(reportStructureObj.SQL),
      INTRO: await populateQuestions(reportStructureObj.INTRO),
      HR: await populateQuestions(reportStructureObj.HR),
      "Resume based question": Array.isArray(reportStructureObj?.resumeBasedQuestions)
        ? reportStructureObj.resumeBasedQuestions.map((q) => ({
            question: q.question,
            aiScore: q.aiScore,
          }))
        : [],
      resumeBasedQuestions: undefined, // Remove the original key
    };
    res.json({
      reportId: report._id,
      candidateId: report.candidateId,
      reportStructure: responseStructure,
    });
  } catch (err) {
    console.error("Error fetching report:", err);
    res
      .status(500)
      .json({ message: "Error fetching report", error: err.message });
  }
};

// 🟡 Get User Reports
exports.getUserReports = async (req, res) => {
  try {
    const candidateId = req.user._id;
    // Fetch all reports for the user, sort by most recent
    const reports = await Report.find({ candidateId, isCompanyInterview: false }).sort({ createdAt: -1 });
    
    // Map to a simplified structure for the dashboard table
    const simplifiedReports = reports.map(report => {
      // Use the raw document to check if 'status' field exists in MongoDB.
      // Older documents won't have it, so we consider them "completed".
      // Newer documents have it, defaulted to "pending" at initialization.
      const isLegacy = !report._doc.hasOwnProperty('status');
      const currentStatus = isLegacy ? "completed" : report.status;
      
      return {
        reportId: report._id,
        role: report.role,
        createdAt: report.createdAt,
        overallScore: report.reportStructure?.overallScore || 0,
        status: currentStatus
      };
    });

    res.json({ reports: simplifiedReports });
  } catch (err) {
    console.error("Error fetching user reports:", err);
    res
      .status(500)
      .json({ message: "Error fetching user reports", error: err.message });
  }
};

// 🟢 Generate Custom Content (For dynamic interview manager)
exports.generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "Missing required field: prompt" });
        }

        const aiResponse = await generateInterviewPrompt(prompt);
        res.json({ text: aiResponse });
    } catch (err) {
        console.error("Error generating dynamic content:", err);
        res.status(500).json({ message: "Error generating dynamic content", error: err.message });
    }
};
