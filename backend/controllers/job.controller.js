const Job = require("../models/job.js");
const Company = require("../models/company.js");

// admin post krega job
exports.postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, expiresAt, assessment } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId || !expiresAt) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        // Validation for assessment if enabled
        if (assessment && assessment.enabled) {
            if (!assessment.questions || assessment.questions.length === 0) {
                return res.status(400).json({
                    message: "At least one question is required for the assessment.",
                    success: false
                });
            }
            if (assessment.questions.length > 10) {
                return res.status(400).json({
                    message: "Maximum 10 questions allowed for the assessment.",
                    success: false
                });
            }
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: salary,
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: req.user.company || companyId,
            created_by: userId,
            expiresAt,
            enableCompanyAIInterview: req.body.enableCompanyAIInterview === true || req.body.enableCompanyAIInterview === 'true',
            aiInterviewTitle: req.body.aiInterviewTitle,
            aiInterviewDescription: req.body.aiInterviewDescription
        });

        // Create Assessment if enabled
        let createdAssessment = null;
        if (assessment && assessment.enabled) {
            const Assessment = require("../models/assessment.model");
            const CodingProblem = require("../models/codingProblem");

            // Fetch question details for snapshots
            const questionsData = await CodingProblem.find({ _id: { $in: assessment.questions } });
            
            let totalMaxScore = 0;
            const snapshots = assessment.questions.map(qId => {
                const q = questionsData.find(item => item._id.toString() === qId.toString());
                let score = 30; // default medium
                const difficulty = (q?.difficulty || "Medium").toLowerCase();
                
                if (difficulty === "easy") score = 15;
                else if (difficulty === "medium") score = 30;
                else if (difficulty === "hard") score = 45;

                totalMaxScore += score;
                return {
                    questionId: qId,
                    difficulty: q?.difficulty || "Medium",
                    score
                };
            });

            const endTime = new Date(expiresAt);
            endTime.setHours(endTime.getHours() + 24);

            createdAssessment = await Assessment.create({
                job: job._id,
                questions: snapshots,
                maxScore: totalMaxScore,
                duration: assessment.questions.length * 30,
                recruiter: userId,
                title: assessment.title || `${title} Assessment`,
                description: assessment.description || `Assessment for ${title} position`,
                startTime: job.createdAt,
                endTime: endTime,
                visibility: 'active'
            });

            // Ensure questions are private and owned by recruiter
            await CodingProblem.updateMany(
                { _id: { $in: assessment.questions } },
                { visibilityStatus: 'private', ownerId: userId }
            );
        }

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            assessment: createdAssessment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// student k liye
exports.getAllJobs = async (req, res) => {
    try {
        const { keyword, location, company, experience, salary } = req.query;
        
        const query = { status: "active" };

        // Keyword Search (Title, Description, Location)
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } },
            ];
        }

        // Location Filter (Now expecting single string, but keeping split just in case)
        if (location) {
            const locations = location.split(",");
            query.location = { $in: locations.map(loc => new RegExp(loc, "i")) };
        }

        // Company Filter (Expecting Object IDs as comma-separated string)
        if (company) {
            const companies = company.split(",");
            query.company = { $in: companies };
        }

        // Experience Level Filter
        if (experience) {
            query.experienceLevel = { $regex: experience, $options: "i" };
        }

        // Salary Filter (Basic string match or range if needed)
        if (salary) {
            query.salary = { $regex: salary, $options: "i" };
        }

        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(200).json({
                jobs: [],
                message: "No jobs found matching your criteria.",
                success: true
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// student
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        // Fetch associated assessment if it exists and is active
        const Assessment = require("../models/assessment.model");
        const assessment = await Assessment.findOne({ job: jobId, visibility: 'active' });

        const jobObj = job.toObject();
        if (assessment) {
            jobObj.assessment = {
                _id: assessment._id,
                startTime: assessment.startTime,
                endTime: assessment.endTime,
                duration: assessment.duration
            };

            // Check if candidate has already completed or submitted this assessment
            const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
            const report = await CodingAssessmentReport.findOne({ 
                assessment: assessment._id, 
                candidate: req.id // req.id is set by protect middleware
            });

            if (report && (report.status === 'completed' || report.status === 'submitted')) {
                jobObj.isAssessmentCompleted = true;
            } else {
                jobObj.isAssessmentCompleted = false;
            }
        }

        return res.status(200).json({ job: jobObj, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// admin kitne job create kra hai abhi tk
exports.getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ company: req.user.company })
            .populate({
                path: 'company',
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'created_by',
                select: 'fullname userName'
            });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const jobId = req.params.id;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                message: "Valid status ('active' or 'inactive') is required.",
                success: false
            });
        }

        // Find the job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Verify ownership (either by company or by the user who created it)
        const isOwner = job.created_by.toString() === req.id.toString() || 
                        (req.user.company && job.company && job.company.toString() === req.user.company.toString());

        if (!isOwner) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to update this job.",
                success: false
            });
        }

        await Job.updateOne({ _id: jobId }, { $set: { status } });

        return res.status(200).json({
            message: `Job status updated to ${status}.`,
            success: true
        });
    } catch (error) {
        console.error("[ERROR] updateJobStatus failed:", error);
        return res.status(500).json({ 
            message: error.message || "Internal server error", 
            success: false 
        });
    }
};

// Get all unique locations for active jobs
exports.getUniqueLocations = async (req, res) => {
    try {
        const locations = await Job.distinct("location", { status: "active" });
        return res.status(200).json({ locations, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get all unique companies for active jobs
exports.getUniqueCompanies = async (req, res) => {
    try {
        // Fetch all companies from the database
        const companies = await Company.find({ status: "active" }).select('name _id logo');
        
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Find the job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Verify ownership
        const isOwner = job.created_by.toString() === req.id.toString() || 
                        (req.user.company && job.company && job.company.toString() === req.user.company.toString());

        if (!isOwner) {
            return res.status(403).json({
                message: "Access denied. You do not have permission to delete this job.",
                success: false
            });
        }

        // Delete associated applications first (as per virtual relationship)
        const Application = require("../models/application.js");
        await Application.deleteMany({ job: jobId });

        // Delete associated assessment if it exists
        const Assessment = require("../models/assessment.model.js");
        await Assessment.deleteOne({ job: jobId });

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("[ERROR] deleteJob failed:", error);
        return res.status(500).json({ 
            message: error.message || "Internal server error", 
            success: false 
        });
    }
};
