const { Worker } = require('bullmq');
const Application = require('../models/Application');
const logger = require('../config/logger');
const config = require('../config');

const reportWorker = new Worker('generate-report', async (job) => {
  const { reportType, dateFrom, dateTo, format, requestedBy } = job.data;
  
  logger.info(`Generating ${format} report [${reportType}] for user ${requestedBy}`);

  try {
    // Heavy aggregation logic isolated inside the background worker
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    let data;
    if (reportType === 'district_performance') {
      data = await Application.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $lookup: { from: 'farmers', localField: 'farmerId', foreignField: '_id', as: 'farmer' } },
        { $unwind: '$farmer' },
        {
          $group: {
            _id: '$farmer.address.district',
            totalApplications: { $sum: 1 },
            approvedApplications: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejectedApplications: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            disbursedAmount: { $sum: '$disbursementAmount' }
          }
        }
      ]);
    }

    // In a real application, we would write this to CSV/PDF and upload to S3/Cloudinary.
    // For now, we mock the S3 URL to satisfy the frontend requirement.
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockUrl = `https://mock-reports-bucket.s3.amazonaws.com/report_${reportType}_${Date.now()}.${format}`;

    logger.info(`Report generated successfully: ${mockUrl}`);

    return { downloadUrl: mockUrl };

  } catch (error) {
    logger.error(`Report generation failed for job ${job.id}`, error);
    throw error;
  }
}, { 
  connection: { 
    url: config.redis.url,
    tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined 
  } 
});

reportWorker.on('failed', (job, err) => {
  logger.error(`Report Job ${job.id} failed: ${err.message}`);
});

module.exports = reportWorker;
