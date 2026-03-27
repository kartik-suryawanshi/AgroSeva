// Basic Twilio stub. We can swap with actual Twilio when keys exist.
const logger = require('../config/logger');

const sendSMS = async (mobileNumber, message) => {
  // Always log the SMS (especially the OTP) to the console for hackathon testing
  logger.info(`==== APP SMS ==== To: ${mobileNumber} | Message: ${message}`);

  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`,
      });
      logger.info(`SMS successfully sent to ${mobileNumber} via Twilio`);
    } else {
      logger.warn(`Twilio not configured. MOCK SMS: [${mobileNumber}] ${message}`);
    }
  } catch (error) {
    logger.error(`Failed to send SMS via Twilio: ${error.message} - Please use the OTP printed above.`);
  }
};

module.exports = { sendSMS };
