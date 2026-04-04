const Redis = require('ioredis');
const logger = require('./logger');
const config = require('./index');

const redisUrl = config.redis.url;

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,          // Don't connect on instantiation — prevents crash at startup
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn('Redis unavailable after 3 retries — running without Redis cache.');
      return null;            // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
});

redisClient.isReady = false;

redisClient.connect().catch(() => {
  logger.warn('Redis not available — caching and rate-limiting will use in-memory fallback.');
});

redisClient.on('connect', () => {
  redisClient.isReady = true;
  logger.info('Redis Client Connected');
});

redisClient.on('error', (err) => {
  redisClient.isReady = false;
  logger.warn(`Redis Client Error: ${err.message}`);
});

module.exports = redisClient;
