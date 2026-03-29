/**
 * Cron Job Bootstrapper
 * Called once during server startup to register all scheduled cron tasks.
 */
const logger = require('../config/logger');

const initCronJobs = () => {
  try {
    const initSLAMonitor = require('./slaMonitor');
    const { initFraudScanner } = require('./fraudScanner');

    initSLAMonitor();
    initFraudScanner();

    logger.info('[CronJobs] ✓ All scheduled automation crons initialized successfully.');
  } catch (error) {
    logger.error('[CronJobs] Failed to initialize cron jobs: ' + error.message);
  }
};

module.exports = initCronJobs;
