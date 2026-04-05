const logger = require('../config/logger');
const config = require('../config');

const sendSMS = async (mobileNumber, message) => {
  // Always log the SMS (especially the OTP) to the console for hackathon testing
  logger.info(`==== APP SMS ==== To: ${mobileNumber} | Message: ${message}`);

  try {
    if (config.twilio.accountSid && config.twilio.authToken) {
      const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
      await client.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
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
