const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Middleware factory to log actions to AuditLog collection.
 * Must be used on routes AFTER the auth middleware so req.user is available.
 * Attaches to res.on('finish') to capture completion.
 */
const logAction = (action, resourceType) => {
  return (req, res, next) => {
    res.on('finish', () => {
      // Only log on successful mutations (or 4xx/5xx if we explicitly want to capture failures, but usually success)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        
        // The router handler should set res.locals.resourceId, res.locals.previousState, res.locals.newState
        const auditEntry = new AuditLog({
          actorId: req.user ? req.user._id : null,
          actorRole: req.user ? req.user.role : 'system',
          action: action,
          resourceType: resourceType,
          resourceId: res.locals.resourceId,
          previousState: res.locals.previousState,
          newState: res.locals.newState,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
          }
        });

        auditEntry.save().catch(err => {
          logger.error(`Failed to save audit log: ${err.message}`, { action, resourceType });
        });
      }
    });
    
    next();
  };
};

module.exports = { logAction };
