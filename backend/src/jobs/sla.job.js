const { Worker } = require('bullmq');
const Grievance = require('../models/Grievance');
const logger = require('../config/logger');
const config = require('../config');

const slaWorker = new Worker('sla-monitor', async () => {
  logger.info(`Starting SLA background sync`);
  const now = new Date();

  try {
    const result = await Grievance.updateMany(
      {
        status: { $in: ['open', 'in_progress', 'pending_info', 'escalated'] },
        slaDeadline: { $lt: now },
        isSlaBreach: false
      },
      {
        $set: { isSlaBreach: true },
        $push: {
          escalationHistory: {
            escalatedTo: 'system',
            reason: 'Automated Breach Detection',
            at: now
          }
        }
      }
    );

    logger.info(`SLA background sync completed. Flagged ${result.modifiedCount} breaches.`);
  } catch (error) {
    logger.error('SLA Sync failed', error);
  }
}, { 
  connection: { 
    url: config.redis.url,
    tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined 
  } 
});

slaWorker.on('failed', (job, err) => {
  logger.error(`SLA Job ${job.id} failed: ${err.message}`);
});

module.exports = slaWorker;
