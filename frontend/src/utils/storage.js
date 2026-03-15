export const VIEWED_JOBS_KEY = 'careerbyte_viewed_jobs';

export const getViewedJobs = () => {
    try {
        const viewed = localStorage.getItem(VIEWED_JOBS_KEY);
        return viewed ? JSON.parse(viewed) : [];
    } catch (error) {
        console.error('Error reading viewed jobs from localStorage:', error);
        return [];
    }
};

export const markJobAsViewed = (jobId) => {
    if (!jobId) return;
    try {
        const viewed = getViewedJobs();
        if (!viewed.includes(jobId)) {
            const updated = [...viewed, jobId];
            localStorage.setItem(VIEWED_JOBS_KEY, JSON.stringify(updated));
            // Dispatch custom event for cross-component sync
            window.dispatchEvent(new Event('viewedJobsUpdated'));
        }
    } catch (error) {
        console.error('Error saving viewed job to localStorage:', error);
    }
};
