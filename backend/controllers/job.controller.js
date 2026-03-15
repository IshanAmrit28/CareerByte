const Job = require("../models/job.js");
const Company = require("../models/company.js");
const { redis, getActiveIndexVersion } = require("../utils/redis");
const { triggerManualScrape } = require("../scripts/scrapedJobs.cron");
const JobScraperService = require("../utils/jobScraper.service");

// Upstash is HTTP based and serverless, so it doesn't maintain an active persistent TCP connection.
// We can assume it's "ready" if the redis instance was successfully created.
const isRedisReady = () => redis !== null;

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
        const { keyword, location, company, experience, salary, source, page = 1, limit = 50 } = req.query;
        
        // --- EXTERNAL JOBS FROM REDIS ---
        if (source === 'external') {
            if (!isRedisReady()) {
                console.warn('[JOB CONTROLLER] Redis is not connected. Serving mock external jobs on-the-fly...');
                try {
                    // Forward keyword to dynamically filter ATS queries
                    const mockJobs = await JobScraperService.fetchAllScrapedJobs(keyword);
                    let filteredJobs = mockJobs;
                    
                    if (keyword) {
                        const kw = keyword.toLowerCase();
                        filteredJobs = filteredJobs.filter(j => 
                            (j.title || '').toLowerCase().includes(kw) || 
                            (j.company || '').toLowerCase().includes(kw) || 
                            (j.location || '').toLowerCase().includes(kw)
                        );
                    }
                    if (location && location !== 'all') {
                        const locs = location.split(",").map(l => l.toLowerCase());
                        filteredJobs = filteredJobs.filter(j => locs.some(l => (j.location || '').toLowerCase().includes(l)));
                    }
                    if (experience && experience !== 'all') {
                        filteredJobs = filteredJobs.filter(j => (j.experienceLevel || '').toLowerCase().includes(experience.toLowerCase()));
                    }

                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

                    return res.status(200).json({
                        jobs: paginatedJobs,
                        message: "Serving live scraped jobs (Redis is disconnected).",
                        success: true
                    });
                } catch (mockError) {
                    console.error('[JOB CONTROLLER] Mock Scrape Error:', mockError.message);
                    return res.status(200).json({
                        jobs: [],
                        message: "External jobs are currently unavailable.",
                        success: true
                    });
                }
            }

            const indexVersion = await getActiveIndexVersion('external_jobs');
            const indexKey = `external_jobs:index:${indexVersion}`;
            
            // Catch error if Redis fails during standard operation
            try {
                const exists = await redis.exists(indexKey);
                if (!exists) {
                    console.log('[JOB CONTROLLER] Redis index empty. Triggering fallback scrape...');
                    triggerManualScrape().catch(console.error);
                    return res.status(200).json({
                        jobs: [],
                        message: "Fetching external jobs. Please try again in a few moments.",
                        success: true
                    });
                }

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit - 1;

                // Upstash Redis uses zrange with option { rev: true } instead of deprecated zrevrange
                const jobIds = await redis.zrange(indexKey, startIndex, endIndex, { rev: true });
                
                if (!jobIds || jobIds.length === 0) {
                    return res.status(200).json({ jobs: [], success: true });
                }

                const pipeline = redis.pipeline();
                jobIds.forEach(id => {
                    pipeline.hgetall(`external_job:${id}`);
                });
                // Upstash returns results directly: [jobData1, jobData2, ...] instead of [[err, jobData1], ...]
                const hashResults = await pipeline.exec();
                
                const jobs = [];
                const idsToRemove = [];
                
                hashResults.forEach((jobData, idx) => {
                    // Check if jobData is a valid non-empty object
                    if (jobData && Object.keys(jobData).length > 0) {
                        if (jobData.requirements && typeof jobData.requirements === 'string') {
                            try { jobData.requirements = JSON.parse(jobData.requirements); } catch(e){}
                        }
                        jobs.push(jobData);
                    } else {
                        idsToRemove.push(jobIds[idx]);
                    }
                });

                if (idsToRemove.length > 0) {
                    console.log(`[JOB CONTROLLER] Cleaning up ${idsToRemove.length} dead references.`);
                    await redis.zrem(indexKey, ...idsToRemove);
                }

                let filteredJobs = jobs;
                if (keyword) {
                    const kw = keyword.toLowerCase();
                    filteredJobs = filteredJobs.filter(j => 
                        (j.title || '').toLowerCase().includes(kw) || 
                        (j.company || '').toLowerCase().includes(kw) || 
                        (j.location || '').toLowerCase().includes(kw)
                    );
                }
                if (location && location !== 'all') {
                    const locs = location.split(",").map(l => l.toLowerCase());
                    filteredJobs = filteredJobs.filter(j => locs.some(l => (j.location || '').toLowerCase().includes(l)));
                }
                if (experience && experience !== 'all') {
                    filteredJobs = filteredJobs.filter(j => (j.experienceLevel || '').toLowerCase().includes(experience.toLowerCase()));
                }
                if (company && company !== 'all') {
                    const companies = company.split(",").map(c => c.toLowerCase());
                    filteredJobs = filteredJobs.filter(j => 
                        companies.some(c => (j.company || '').toLowerCase() === c || (j.company || '').toLowerCase().includes(c))
                    );
                }

                return res.status(200).json({ jobs: filteredJobs, success: true });
            } catch (redisError) {
                console.error('[JOB CONTROLLER] Redis Error in external jobs:', redisError.message);
                return res.status(200).json({
                    jobs: [],
                    message: "Temporary issue fetching external jobs.",
                    success: true
                });
            }
        }

        // --- INTERNAL JOBS LOGIC ---
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
        if (location && location !== 'all') {
            const locations = location.split(",");
            query.location = { $in: locations.map(loc => new RegExp(loc, "i")) };
        }

        // Company Filter (Expecting Object IDs as comma-separated string)
        if (company && company !== 'all') {
            const companies = company.split(",");
            query.company = { $in: companies };
        }

        // Experience Level Filter
        if (experience && experience !== 'all') {
            query.experienceLevel = { $regex: experience, $options: "i" };
        }

        // Salary Filter (Basic string match or range if needed)
        if (salary && salary !== 'all') {
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

// Get all unique locations for active jobs (Internal + External)
exports.getUniqueLocations = async (req, res) => {
    try {
        const internalLocations = await Job.distinct("location", { status: "active" });
        let externalLocations = [];
        
        if (isRedisReady()) {
            externalLocations = await redis.smembers('external_jobs:locations') || [];
        }

        // Merge and deduplicate (Normalized to handle " Toronto" vs "Toronto")
        const allLocationsSet = new Set();
        internalLocations.forEach(loc => { if (loc) allLocationsSet.add(loc.trim()); });
        externalLocations.forEach(loc => { if (loc) allLocationsSet.add(loc.trim()); });
        
        const locations = Array.from(allLocationsSet).sort();
        console.log(`[JOB CONTROLLER] Returning ${locations.length} total unique locations (${internalLocations.length} internal, ${externalLocations.length} external).`);

        return res.status(200).json({ locations, success: true });
    } catch (error) {
        console.error("[ERROR] getUniqueLocations failed:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Get all unique companies for active jobs (Internal + External)
exports.getUniqueCompanies = async (req, res) => {
    try {
        const internalCompanies = await Company.find({ status: "active" }).select('name _id logo');
        let externalCompanyNames = [];

        if (isRedisReady()) {
            externalCompanyNames = await redis.smembers('external_jobs:companies') || [];
        }

        // Use a Map for deduplication by Name to handle overlaps gracefully
        const companiesMap = new Map();

        // 1. Prioritize Internal Companies (they have logos and real IDs)
        internalCompanies.forEach(comp => {
            companiesMap.set(comp.name.toLowerCase().trim(), {
                name: comp.name,
                _id: comp._id,
                logo: comp.logo,
                isExternal: false
            });
        });

        // 2. Add External Companies if not already present
        externalCompanyNames.forEach(name => {
            const key = name.toLowerCase().trim();
            if (!companiesMap.has(key)) {
                companiesMap.set(key, {
                    name: name.trim(),
                    _id: name.trim(),
                    isExternal: true
                });
            }
        });

        const companies = Array.from(companiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        console.log(`[JOB CONTROLLER] Returning ${companies.length} total unique companies (${internalCompanies.length} internal, ${externalCompanyNames.length} external).`);

        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.error("[ERROR] getUniqueCompanies failed:", error);
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
