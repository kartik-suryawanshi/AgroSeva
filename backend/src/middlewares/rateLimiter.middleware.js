const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const makeRedisStore = (prefix) => {
  if (!redisClient.isReady) return undefined; // use in-memory fallback
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix,
  });
};

// 5 requests per 15min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  store: makeRedisStore('rl:auth:'),
});

// 100 requests per minute per userId (fallback to IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
  keyGenerator: (req, res) => {
    return req.user ? req.user._id.toString() : ipKeyGenerator(req, res);
  },
  store: makeRedisStore('rl:api:'),
});

// 10 uploads per hour per userId
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit exceeded, please try again later.' },
  keyGenerator: (req, res) => {
    return req.user ? req.user._id.toString() : ipKeyGenerator(req, res);
  },
  store: makeRedisStore('rl:upload:'),
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };

