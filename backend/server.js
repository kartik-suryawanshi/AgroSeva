require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const logger = require('./src/config/logger');
// require('./src/config/redis'); // Initialize Redis

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database completely resolving before listening
    const connectDB = require('./src/config/db');
    await connectDB();
    
    // Initialize Background Workers
    require('./src/jobs/index')();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
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
