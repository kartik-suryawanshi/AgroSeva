const { Worker } = require('bullmq');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const Farmer = require('../models/Farmer');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const logger = require('../config/logger');
const config = require('../config');

const batchReevalWorker = new Worker('batch-eligibility-reeval', async (job) => {
  const { schemeId } = job.data;
  const scheme = await Scheme.findById(schemeId).lean();
  if (!scheme) throw new Error('Scheme not found');

  logger.info(`Starting batch re-evaluation for scheme ${schemeId}`);

  let page = 1;
  while (true) {
    const apps = await Application.find({ schemeId, status: { $in: ['submitted', 'ineligible'] } })
      .skip((page - 1) * 50)
      .limit(50);
      
    if (apps.length === 0) break;

    for (const app of apps) {
      const farmer = await Farmer.findById(app.farmerId).lean();
      if (!farmer) continue;

      const result = evaluateEligibility(farmer, scheme);
      app.eligibilityResult = {
        ...result,
        evaluatedBy: 'system',
      };

      // Auto update status if score changed
      if (!result.isEligible && result.summary.mandatoryFailed.length > 0) {
        app.status = 'ineligible';
      } else if (app.status === 'ineligible' && result.isEligible) {
        app.status = 'submitted'; // restore to queue
      }

      await app.save();
    }
    page++;
  }

  logger.info(`Completed batch re-evaluation for scheme ${schemeId}`);
}, { 
  connection: { 
    url: config.redis.url,
    tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined 
  } 
});

batchReevalWorker.on('failed', (job, err) => {
  logger.error(`Batch Re-eval Job ${job.id} failed: ${err.message}`);
});

module.exports = batchReevalWorker;
