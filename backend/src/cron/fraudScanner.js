/**
 * Fraud Scanner Cron Job
 * Runs every Sunday at midnight — scans recent applications with no fraud flags yet.
 * Posts batches of 50 to the Python AI service for risk assessment.
 * Any suspicious applications get flagged with risk factors in the DB.
 */
const cron = require('node-cron');
const axios = require('axios');
const Application = require('../models/Application');
const logger = require('../config/logger');

const BATCH_SIZE = 50;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

const runFraudScanner = async () => {
  logger.info('[CronJob:FraudScanner] Starting weekly fraud scan batch...');

  try {
    // Find applications from last 30 days with no fraud flags
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const unflaggedApps = await Application.find({
      createdAt: { $gte: thirtyDaysAgo },
      fraudFlags: { $size: 0 },
      status: { $nin: ['cancelled'] },
    })
      .populate('farmerId', 'personalDetails address landDetails bankDetails annualIncome')
      .limit(500) // Max 500 per weekly batch
      .lean();

    if (unflaggedApps.length === 0) {
      logger.info('[CronJob:FraudScanner] No unflagged applications to scan. Exiting.');
      return;
    }

    logger.info(`[CronJob:FraudScanner] Found ${unflaggedApps.length} applications to scan. Processing in batches of ${BATCH_SIZE}...`);

    let totalFlagged = 0;

    // Process in batches of 50
    for (let i = 0; i < unflaggedApps.length; i += BATCH_SIZE) {
      const batch = unflaggedApps.slice(i, i + BATCH_SIZE);

      const payload = batch.map(app => ({
        applicationId: app._id.toString(),
        applicationCode: app.applicationId,
        submittedData: app.submittedData,
        eligibilityScore: app.eligibilityResult?.score || 0,
        farmerProfile: app.farmerId || {},
      }));

      try {
        const { data } = await axios.post(
          `${AI_SERVICE_URL}/fraud/scan`,
          { applications: payload },
          { timeout: 30000 }
        );

        const flags = data.results || [];
        const suspicious = flags.filter(f => f.isSuspicious);

        if (suspicious.length > 0) {
          // Write risk flags back to each suspicious application
          await Promise.all(
            suspicious.map(flag =>
              Application.findByIdAndUpdate(flag.applicationId, {
                $push: {
                  fraudFlags: {
                    $each: flag.reasons.map(reason => ({
                      flagType: 'ml_fraud_scan',
                      reason,
                      severity: flag.riskScore > 0.8 ? 'high' : flag.riskScore > 0.5 ? 'medium' : 'low',
                      flaggedAt: new Date(),
                    })),
                  },
                },
              })
            )
          );
          totalFlagged += suspicious.length;
          logger.warn(`[CronJob:FraudScanner] Batch ${Math.ceil(i / BATCH_SIZE) + 1}: Flagged ${suspicious.length} suspicious application(s).`);
        }
      } catch (batchErr) {
        // If AI service is offline, log and move on — don't crash the server
        if (batchErr.code === 'ECONNREFUSED' || batchErr.code === 'ETIMEDOUT') {
          logger.warn('[CronJob:FraudScanner] AI service unreachable. Fraud scan skipped this cycle. Will retry next Sunday.');
          return;
        }
        logger.error(`[CronJob:FraudScanner] Batch error: ${batchErr.message}`);
      }

      // Rate limiting: wait 500ms between batches
      if (i + BATCH_SIZE < unflaggedApps.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logger.info(`[CronJob:FraudScanner] ✓ Scan complete. Total flagged this run: ${totalFlagged} application(s).`);

  } catch (error) {
    logger.error('[CronJob:FraudScanner] Critical failure:', error.message);
  }
};

const initFraudScanner = () => {
  // Run every Sunday at 00:00 IST
  cron.schedule('0 0 * * 0', runFraudScanner, {
    timezone: 'Asia/Kolkata',
  });

  logger.info('[CronJob:FraudScanner] Scheduled — runs every Sunday at midnight (IST)');
};

// Also expose manual trigger for admin use
module.exports = { initFraudScanner, runFraudScanner };
