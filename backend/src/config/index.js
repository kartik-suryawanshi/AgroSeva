const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // Database & Redis
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME || 'agro_seva',
  },
  redis: {
    url: process.env.BULL_REDIS_URL || 'redis://localhost:6379',
  },
  
  // Auth
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_please_change',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_please_change',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  
  // External Services
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:5002',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  // Media Storage
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // SMS (Twilio)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Security
  rateLimit: {
    windowMs: parseInt(process.env.WINDOW_MS || '900000'), // 15 mins
    max: parseInt(process.env.MAX_LIMIT || '100'),
  }
};

// Validate critical secrets in production
if (config.env === 'production') {
  const criticalKeys = [
    'mongodb.uri',
    'jwt.secret',
    'jwt.refreshSecret',
    'cloudinary.cloudName',
    'cloudinary.apiKey',
    'cloudinary.apiSecret'
  ];
  
  const missingKeys = [];
  criticalKeys.forEach(key => {
    const val = key.split('.').reduce((o, p) => (o ? o[p] : undefined), config);
    if (!val) missingKeys.push(key);
  });
  
  if (missingKeys.length > 0) {
    throw new Error(`Production Config Error: Missing required environment variables: ${missingKeys.join(', ')}`);
  }
}

module.exports = config;
