const { Worker } = require('bullmq');
const axios = require('axios');
const Grievance = require('../models/Grievance');
const logger = require('../config/logger');

const categoryDeptMap = {
  'subsidy_delay': 'Subsidy Department',
  'insurance_issue': 'Insurance Department',
  'land_record_error': 'Revenue & Land Records',
  'wrong_rejection': 'Appellate Authority',
  'officer_misconduct': 'Vigilance & Ethics',
  'scheme_query': 'General Inquiry',
  'other': 'General Administration'
};

const nlpWorker = new Worker('nlp-analyze', async (job) => {
  const { grievanceId } = job.data;
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) throw new Error('Grievance not found');

  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    
    // Call Python microservice
    const textToAnalyze = `${grievance.subject}. ${grievance.description}`;
    const response = await axios.post(`${aiUrl}/nlp/analyze`, { text: textToAnalyze });
    const { detectedCategory, urgencyScore, sentimentScore, keywords } = response.data;

    grievance.nlpAnalysis = {
      detectedCategory,
      urgencyScore,
      sentimentScore,
      keywords,
      processedAt: new Date(),
    };

    // Auto update Priority based on ML urgency Score (0 to 1)
    if (urgencyScore > 0.8) grievance.priority = 'critical';
    else if (urgencyScore > 0.6) grievance.priority = 'high';
    else if (urgencyScore > 0.4) grievance.priority = 'medium';
    else grievance.priority = 'low';

    // Update SLAs based on new priority
    const slaDays = grievance.priority === 'critical' ? 2 : grievance.priority === 'high' ? 3 : grievance.priority === 'medium' ? 7 : 14;
    grievance.slaDeadline = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000);

    // Auto-assign department based on NLP classification or user's exact choice
    const classificationToUse = detectedCategory || grievance.category;
    grievance.assignedDepartment = categoryDeptMap[classificationToUse] || 'General Administration';

    await grievance.save();
    logger.info(`NLP analysis completed for grievance ${grievanceId}`);

  } catch (error) {
    logger.error(`NLP analysis failed for grievance ${grievanceId}`, error);
    throw error;
  }
}, { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });

nlpWorker.on('failed', (job, err) => {
  logger.error(`NLP Job ${job.id} failed: ${err.message}`);
});

module.exports = nlpWorker;
