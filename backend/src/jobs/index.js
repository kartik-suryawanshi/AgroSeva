const logger = require('../config/logger');

const initializeWorkers = () => {
  try {
    require('./ocr.job');
    require('./nlp.job');
    require('./notification.job');
    require('./eligibility.job');
    require('./sla.job');
    require('./report.job');
    
    logger.info('BullMQ Background Workers initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize BullMQ workers: ' + error.message);
  }
};

module.exports = initializeWorkers;
