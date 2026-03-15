const crypto = require('crypto');
const pLimit = require('p-limit').default || require('p-limit');
const { redis } = require('./redis');
const axios = require('axios');

// Top tech companies using ATS (Greenhouse and Lever)
const GREENHOUSE_BOARDS = ['stripe', 'discord', 'airbnb', 'figma'];
const LEVER_BOARDS = ['netflix', 'shopify'];

// Real job sources using official JSON APIs or ATS public feeds
const API_SOURCES = [
    {
        sourceName: 'Remotive',
        fetchJobs: async (searchQuery) => {
            try {
                const res = await axios.get(process.env.REMOTIVE_API_URL);
                let rawJobs = res.data.jobs || [];
                
                if (searchQuery) {
                    rawJobs = rawJobs.filter(job => JobScraperService.matchesSearch(job.title, searchQuery));
                }
                
                return rawJobs.map(job => ({
                    title: job.title,
                    company: job.company_name,
                    location: job.candidate_required_location || 'Remote',
                    applyUrl: job.url,
                    description: job.description ? job.description.substring(0, 200) + '...' : 'Remote software development role.',
                    salary: job.salary || 'Not Disclosed',
                    experienceLevel: 'Not specified',
                    jobType: job.job_type ? job.job_type.replace('_', ' ') : 'Full-time',
                    requirements: job.tags || ['Software Engineering']
                }));
            } catch (error) {
                console.error('[REMOTIVE API ERROR]', error.message);
                return [];
            }
        }
    },
    {
        sourceName: 'Arbeitnow',
        fetchJobs: async (searchQuery) => {
            try {
                const res = await axios.get(process.env.ARBEITNOW_API_URL);
                const rawJobs = res.data.data || [];
                // Filter for developer roles OR dynamic search and limit to 15
                return rawJobs
                    .filter(job => {
                        if (searchQuery) {
                            return JobScraperService.matchesSearch(job.title, searchQuery);
                        }
                        return job.title.toLowerCase().includes('engineer') || job.title.toLowerCase().includes('developer');
                    })
                    .slice(0, 15)
                    .map(job => ({
                        title: job.title,
                        company: job.company_name,
                        location: job.location || 'Remote',
                        applyUrl: job.url,
                        description: job.description ? job.description.substring(0, 200) + '...' : 'Details inside.',
                        salary: 'Not Disclosed',
                        experienceLevel: 'Not specified',
                        jobType: job.job_types && job.job_types.length > 0 ? job.job_types[0] : 'Full-time',
                        requirements: job.tags || ['General']
                    }));
            } catch (error) {
                console.error('[ARBEITNOW API ERROR]', error.message);
                return [];
            }
        }
    },
    // Dynamically generate Greenhouse ATS Fetchers
    ...GREENHOUSE_BOARDS.map(board => ({
        sourceName: `Greenhouse (${board})`,
        fetchJobs: async (searchQuery) => {
            try {
                const res = await axios.get(`${process.env.GREENHOUSE_API_BASE_URL}${board}/jobs`);
                const rawJobs = res.data.jobs || [];
                return rawJobs
                    .filter(job => {
                        if (searchQuery) {
                            return JobScraperService.matchesSearch(job.title, searchQuery);
                        }
                        return job.title.toLowerCase().includes('engineer') || job.title.toLowerCase().includes('developer');
                    })
                    .slice(0, 5) // Limit to top roles per company
                    .map(job => ({
                        title: job.title,
                        company: board.charAt(0).toUpperCase() + board.slice(1),
                        location: job.location?.name || 'Remote',
                        applyUrl: job.absolute_url,
                        description: 'Apply on the official company career site for more details.',
                        salary: 'Not Disclosed',
                        experienceLevel: 'Not specified',
                        jobType: 'Full-time',
                        requirements: ['Engineering Core']
                    }));
            } catch (error) {
                console.error(`[GREENHOUSE API ERROR - ${board}]`, error.message);
                return [];
            }
        }
    })),
    // Dynamically generate Lever ATS Fetchers
    ...LEVER_BOARDS.map(account => ({
        sourceName: `Lever (${account})`,
        fetchJobs: async (searchQuery) => {
            try {
                const res = await axios.get(`${process.env.LEVER_API_BASE_URL}${account}`);
                const rawJobs = res.data || [];
                return rawJobs
                    .filter(job => {
                        if (searchQuery) {
                            return JobScraperService.matchesSearch(job.text, searchQuery);
                        }
                        return job.text.toLowerCase().includes('engineer') || job.text.toLowerCase().includes('developer');
                    })
                    .slice(0, 5) // Limit to top roles per company
                    .map(job => ({
                        title: job.text,
                        company: account.charAt(0).toUpperCase() + account.slice(1),
                        location: job.categories?.location || 'Remote',
                        applyUrl: job.hostedUrl,
                        description: job.descriptionPlain ? job.descriptionPlain.substring(0, 200) + '...' : 'Apply on the official company career site.',
                        salary: 'Not Disclosed',
                        experienceLevel: job.categories?.commitment || 'Not specified',
                        jobType: job.categories?.commitment || 'Full-time',
                        requirements: job.categories?.team ? [job.categories.team] : ['Engineering']
                    }));
            } catch (error) {
                console.error(`[LEVER API ERROR - ${account}]`, error.message);
                return [];
            }
        }
    }))
];

class JobScraperService {
    /**
     * Checks if a title dynamically matches ALL terms in a space-separated search query
     */
    static matchesSearch(title, searchQuery) {
        if (!title || !searchQuery) return true; // If no query, skip filter
        
        const titleLower = title.toLowerCase();
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean); // Split by whitespace into array
        
        // Ensure every search keyword exists somewhere in the title (ex: "frontend react" -> both must be present)
        return keywords.every(keyword => titleLower.includes(keyword));
    }

    /**
     * Normalizes location strings (e.g., "London, United Kingdom" -> "London")
     * to reduce redundancy in filters.
     */
    static cleanLocation(location) {
        if (!location) return 'Remote';
        
        // Remove common regions/countries for broad matching
        // e.g., "London, United Kingdom" -> ["London", "United Kingdom"] -> "London"
        let parts = location.split(/[,|\/]/).map(p => p.trim());
        if (parts.length > 0) {
            let primary = parts[0];
            // Handle common cases like "Remote - USA"
            if (primary.toLowerCase().includes('remote')) return 'Remote';
            return primary;
        }
        return location;
    }

    /**
     * Generate MD5 hash as ID to prevent duplicates
     */
    static generateJobId(title, company, location) {
        const hash = crypto.createHash('md5');
        const cleanLoc = this.cleanLocation(location);
        hash.update(`${title.trim().toLowerCase()}|${company.trim().toLowerCase()}|${cleanLoc.toLowerCase()}`);
        return hash.digest('hex');
    }

    /**
     * Normalizes raw job data into our standard schema
     */
    static normalizeJob(rawJob, sourceName) {
        const normalizedLocation = this.cleanLocation(rawJob.location);
        return {
            id: this.generateJobId(rawJob.title, rawJob.company, normalizedLocation),
            title: rawJob.title,
            company: rawJob.company,
            location: normalizedLocation,
            source: sourceName,
            applyUrl: rawJob.applyUrl,
            description: rawJob.description || '',
            salary: rawJob.salary || 'Not specified',
            experienceLevel: rawJob.experienceLevel || 'Not specified',
            jobType: rawJob.jobType || 'Full-time',
            requirements: JSON.stringify(rawJob.requirements || []), // Stringify arrays for Redis Hashes
            isExternal: 'true', // string for Redis parity
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Fetches jobs from all defined sources (optionally filtering by dynamic search string)
     */
    static async fetchAllScrapedJobs(searchQuery = null) {
        const limit = pLimit(2); // Max 2 concurrent requests to avoid rate limits
        let allNormalizedJobs = [];

        const fetchPromises = API_SOURCES.map(source => 
            limit(async () => {
                try {
                    console.log(`[SCRAPER] Fetching jobs from ${source.sourceName}...`);
                    const rawJobs = await source.fetchJobs(searchQuery);
                    const normalized = rawJobs.map(job => this.normalizeJob(job, source.sourceName));
                    allNormalizedJobs.push(...normalized);
                    console.log(`[SCRAPER] Fetched ${normalized.length} jobs from ${source.sourceName}.`);
                } catch (error) {
                    console.error(`[SCRAPER ERROR] Failed to fetch from ${source.sourceName}:`, error.message);
                    // Silently continue so one source failure doesn't break the whole job
                }
            })
        );

        await Promise.all(fetchPromises);
        return allNormalizedJobs;
    }

    /**
     * Saves jobs to Redis using Hashes and a ZSET index version
     */
    static async saveJobsToRedis(jobs, indexVersion) {
        if (!redis) return;
        if (!jobs || jobs.length === 0) return;

        // Limit the storage to only the first 150 jobs (minimizing read/write operations)
        const jobLimit = 150;
        const limitedJobs = jobs.slice(0, jobLimit);

        const pipeline = redis.pipeline();
        const TWO_WEEKS_SECONDS = 14 * 24 * 60 * 60;
        const indexKey = `external_jobs:index:${indexVersion}`;
        const locationKey = `external_jobs:locations`;
        const companyKey = `external_jobs:companies`;
        
        let addedCount = 0;

        for (const job of limitedJobs) {
            const jobKey = `external_job:${job.id}`;
            const timestamp = Date.now();

            // 1. ZSET Population: Add to the versioned index
            pipeline.zadd(indexKey, { score: timestamp, member: job.id });
            
            // 2. Hash Storage: Save individual fields memory efficiently
            pipeline.hset(jobKey, job);
            
            // 3. Set TTL on the individual job data
            pipeline.expire(jobKey, TWO_WEEKS_SECONDS);

            // 4. Index Unique Filter values
            if (job.location) pipeline.sadd(locationKey, job.location);
            if (job.company) pipeline.sadd(companyKey, job.company);

            addedCount++;
        }

        // 5. Set TTL on the index elements
        pipeline.expire(indexKey, TWO_WEEKS_SECONDS + 3600);
        pipeline.expire(locationKey, TWO_WEEKS_SECONDS + 3600);
        pipeline.expire(companyKey, TWO_WEEKS_SECONDS + 3600);

        await pipeline.exec();
        console.log(`[SCRAPER] Successfully pipelined ${addedCount} jobs to Redis (Index: ${indexKey}).`);
    }
}

module.exports = JobScraperService;
