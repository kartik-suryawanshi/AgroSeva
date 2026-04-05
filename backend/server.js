require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const logger = require('./src/config/logger');
// require('./src/config/redis'); // Initialize Redis

// Prioritize PORT from environment (e.g., Render) over .env defaults if possible
const PORT = process.env.PORT || 5002;
const ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connect to database completely resolving before listening
    const connectDB = require('./src/config/db');
    await connectDB();

    // Initialize Background Workers (BullMQ)
    require('./src/jobs/index')();

    // Initialize Scheduled Cron Automations
    require('./src/cron/index')();

    const server = http.createServer(app);
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${ENV} mode on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
