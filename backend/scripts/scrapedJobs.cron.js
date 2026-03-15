const cron = require('node-cron');
const { redisLock, getActiveIndexVersion, setActiveIndexVersion } = require('../utils/redis');
const JobScraperService = require('../utils/jobScraper.service');

const SCRAPER_LOCK_KEY = 'cron:scraper:lock';
const INDEX_BASE_KEY = 'external_jobs';

/**
 * Main scraping task
 * It uses a Redis lock to ensure only one app instance runs this at a time.
 */
const runScrapeContext = async (isManual = false) => {
    console.log(`[SCRAPER CRON] Starting ${isManual ? 'manual ' : ''}job scraping process...`);
    
    // Acquire a 5-minute lock.
    const locked = await redisLock.acquireLock(SCRAPER_LOCK_KEY, 300);
    if (!locked) {
        console.log('[SCRAPER CRON] Another instance is already scraping. Skipping run.');
        return false;
    }

    try {
        const jobs = await JobScraperService.fetchAllScrapedJobs();
        
        if (jobs && jobs.length > 0) {
            const currentVersion = await getActiveIndexVersion(INDEX_BASE_KEY);
            // Toggle version to create atomic swap (v1 <-> v2)
            const newVersion = currentVersion === 'v1' ? 'v2' : 'v1';
            
            console.log(`[SCRAPER CRON] Saving to index version ${newVersion}.`);
            await JobScraperService.saveJobsToRedis(jobs, newVersion);
            
            // Pointer swap
            await setActiveIndexVersion(INDEX_BASE_KEY, newVersion);
            console.log('[SCRAPER CRON] Cache refresh complete. Active version updated.');
            return true;
        } else {
            console.log('[SCRAPER CRON] Yielded no jobs.');
            return false;
        }

    } catch (error) {
        console.error('[SCRAPER CRON FATAL] Failed during scrape cycle:', error.message);
        return false;
    } finally {
        await redisLock.releaseLock(SCRAPER_LOCK_KEY);
        console.log('[SCRAPER CRON] Lock released.');
    }
};

/**
 * Schedule daily
 */
const scheduleJobScraper = () => {
    // Run at 2:00 AM every day
    cron.schedule('0 2 * * *', () => {
        runScrapeContext().catch(console.error);
    });
    console.log('[CRON INIT] Scheduled daily external job scraper.');
};

module.exports = {
    scheduleJobScraper,
    triggerManualScrape: async () => runScrapeContext(true)
};
