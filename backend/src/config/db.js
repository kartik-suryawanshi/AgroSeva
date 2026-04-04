const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
