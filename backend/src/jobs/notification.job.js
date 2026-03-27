const { Worker } = require('bullmq');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSMS } = require('../utils/sms');
const logger = require('../config/logger');

const notifWorker = new Worker('send-notification', async (job) => {
  const { recipientId, type, title, message, data, channels } = job.data;
  
  const user = await User.findById(recipientId);
  if (!user) throw new Error('Recipient user not found');

  try {
    // 1. Create In-App Notification
    if (channels.includes('in_app')) {
      await Notification.create({
        recipientId,
        type,
        title,
        message,
        data,
        channel: ['in_app'],
      });
    }

    // 2. Send SMS via Twilio
    if (channels.includes('sms') && user.mobileNumber) {
      await sendSMS(user.mobileNumber, `${title}: ${message}`);
    }

    // 3. Email (skipped stub for Hackathon to save time, logic translates exactly as SMS)

    logger.info(`Notification sent to ${recipientId} via ${channels.join(', ')}`);
  } catch (error) {
    logger.error(`Notification delivery failed for ${recipientId}`, error);
    throw error;
  }
}, { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });

notifWorker.on('failed', (job, err) => {
  logger.error(`Notification Job ${job.id} failed: ${err.message}`);
});

module.exports = notifWorker;
