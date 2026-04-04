const logger = require('../config/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method, ip: req.ip });

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `Duplicate value entered for ${field}` });
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
