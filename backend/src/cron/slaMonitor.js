/**
 * SLA Monitor Cron Job
 * Runs every hour — scans all open grievances and:
 *   1. Marks breached tickets as isSlaBreach = true
 *   2. Auto-escalates their status to 'escalated'
 *   3. Logs the escalation in the grievance's history
 */
const cron = require('node-cron');
const Grievance = require('../models/Grievance');
const logger = require('../config/logger');

const runSLAMonitor = async () => {
  try {
    const now = new Date();
    logger.info('[CronJob:SLAMonitor] Running hourly SLA breach scan...');

    const result = await Grievance.updateMany(
      {
        status: { $in: ['open', 'in_progress', 'pending_info'] },
        slaDeadline: { $lt: now },
        isSlaBreach: false,
      },
      {
        $set: {
          isSlaBreach: true,
          status: 'escalated', // Auto-escalate the status
        },
        $push: {
          escalationHistory: {
            escalatedTo: 'Nodal Officer',
            reason: 'SLA deadline exceeded — auto-escalated by system',
            at: now,
          },
        },
      }
    );

    if (result.modifiedCount > 0) {
      logger.warn(`[CronJob:SLAMonitor] ⚠ Escalated ${result.modifiedCount} grievance(s) that breached their SLA.`);
    } else {
      logger.info('[CronJob:SLAMonitor] ✓ No SLA breaches detected.');
    }
  } catch (error) {
    logger.error('[CronJob:SLAMonitor] Failed:', error.message);
  }
};

const initSLAMonitor = () => {
  // Run at the top of every hour
  cron.schedule('0 * * * *', runSLAMonitor, {
    timezone: 'Asia/Kolkata',
  });
  
  // Also run immediately on startup to catch any overnight breaches
  runSLAMonitor();

  logger.info('[CronJob:SLAMonitor] Scheduled — runs every hour at :00 (IST)');
};

module.exports = initSLAMonitor;
