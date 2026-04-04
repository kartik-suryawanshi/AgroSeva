const { Worker } = require('bullmq');
const axios = require('axios');
const Document = require('../models/Document');
const logger = require('../config/logger');
const config = require('../config');

const ocrWorker = new Worker('ocr-process', async (job) => {
  const { documentId } = job.data;
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error('Document not found');

  try {
    const aiUrl = config.aiService.url;
    
    // Call Python microservice
    const response = await axios.post(`${aiUrl}/ocr`, { imageUrl: doc.cloudinaryUrl });
    const { rawText, extractedFields, confidence } = response.data;

    doc.ocrData = {
      rawText,
      extractedFields,
      confidence,
      processedAt: new Date(),
      ocrEngine: 'Tesseract & Extractor'
    };

    if (confidence < 0.6) {
      doc.verificationStatus = 'pending';
      doc.verificationRemarks = 'Low OCR confidence. Requires manual verification.';
    }

    await doc.save();
    logger.info(`OCR processing completed for document ${documentId}`);

  } catch (error) {
    logger.error(`OCR processing failed for document ${documentId}`, error);
    throw error;
  }
}, { 
  connection: { 
    url: config.redis.url,
    tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined 
  } 
});

ocrWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

module.exports = ocrWorker;
