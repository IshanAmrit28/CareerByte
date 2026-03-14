const Application = require("../models/application.js");
const Job = require("../models/job.js");

exports.applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            });
        }
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });

        if (!applications || applications.length === 0) {
            return res.status(200).json({
                application: [],
                success: true
            });
        }

        // Fetch associated assessments for these jobs
        const jobIds = applications.map(app => app.job?._id).filter(id => id);
        const Assessment = require("../models/assessment.model");
        const assessments = await Assessment.find({ job: { $in: jobIds }, visibility: 'active' });

        // Fetch reports to check if already submitted
        const CodingAssessmentReport = require("../models/codingAssessmentReport.model");
        const reports = await CodingAssessmentReport.find({ 
            candidate: userId, 
            assessment: { $in: assessments.map(a => a._id) } 
        });

        // Map assessments to applications
        const applicationsWithAssessments = applications.map(app => {
            const appObj = app.toObject();
            if (app.job) {
                const assessment = assessments.find(a => a.job.toString() === app.job._id.toString());
                if (assessment) {
                    const report = reports.find(r => r.assessment.toString() === assessment._id.toString());
                    appObj.assessment = {
                        _id: assessment._id,
                        startTime: assessment.startTime,
                        endTime: assessment.endTime,
                        duration: assessment.duration,
                        isSubmitted: report && (report.status === 'completed' || report.status === 'submitted')
                    };
                }
            }
            return appObj;
        });

        return res.status(200).json({
            application: applicationsWithAssessments,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// admin dekhega kitna user ne apply kiya hai
exports.getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        // Find job and ensure it belongs to the recruiter's company
        const job = await Job.findOne({ _id: jobId, company: req.user.company }).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: [
                { path: 'applicant' },
                { path: 'updatedBy', select: 'fullname userName' }
            ]
        });
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }
        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            });
        }

        // find the application by applicantion id
        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // update the status
        application.status = status.toLowerCase();
        application.updatedBy = req.id; // Record who updated it
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
