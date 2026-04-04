require('express-async-errors'); // Wrapper to catch async errors automatically
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./src/config');

const app = express();

// Security & Parsing
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "res.cloudinary.com"],
    },
  },
}));
app.use(cors({ origin: config.frontend.url, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/public', require('./src/routes/public.routes'));
app.use('/api/farmer', require('./src/routes/farmer.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Global Error Handler
const errorHandler = require('./src/middlewares/errorHandler.middleware');
app.use(errorHandler);

module.exports = app;
