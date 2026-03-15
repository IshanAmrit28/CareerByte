const { Redis } = require('@upstash/redis');

let redis = null;
try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    if (url && url !== "YOUR_UPSTASH_URL_HERE") {
        redis = Redis.fromEnv();
        console.log('[REDIS CONNECTED] Upstash initialized successfully.');
    } else {
        console.warn('[REDIS WARNING] Upstash credentials missing. External cache disabled.');
    }
} catch (e) {
    console.warn('[REDIS ERROR]', e.message);
}

/**
 * RedisLock utility for distributed locking
 * Essential for ensuring cron jobs don't overlap across multiple instances
 */
class RedisLock {
    constructor(client) {
        this.client = client;
    }

    /**
     * Attempts to acquire a lock
     * @param {string} lockKey - The key to lock
     * @param {number} ttlSeconds - Time-to-live for the lock in seconds
     * @returns {Promise<boolean>} - True if acquired, false otherwise
     */
    async acquireLock(lockKey, ttlSeconds = 60) {
        if (!this.client) return false;
        try {
            // Upstash set format: set(key, value, { ex: ttl, nx: true })
            const result = await this.client.set(lockKey, Date.now(), { ex: ttlSeconds, nx: true });
            return result === 'OK';
        } catch (e) {
            return false;
        }
    }

    /**
     * Releases a lock
     * @param {string} lockKey - The key to unlock
     */
    async releaseLock(lockKey) {
        if (!this.client) return;
        try {
            await this.client.del(lockKey);
        } catch (e) {}
    }
}

const redisLock = new RedisLock(redis);

/**
 * Versioning Utility for Cache/Index Swapping
 * Used to atomically swap the active set of items (e.g., v1 -> v2)
 */
const getActiveIndexVersion = async (baseKey) => {
    if (!redis) return 'v1';
    const version = await redis.get(`${baseKey}:current_version`);
    return version || 'v1';
};

const setActiveIndexVersion = async (baseKey, version) => {
    if (!redis) return;
    await redis.set(`${baseKey}:current_version`, version);
};

module.exports = {
    redis,
    redisLock,
    getActiveIndexVersion,
    setActiveIndexVersion
};
