const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Fetch fresh user to check if active
      const user = await User.findById(decoded.userId).lean();
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = await User.findById(decoded.userId).lean();
      } catch (err) {
        // Ignore errors for optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth, requireRole, optionalAuth };
