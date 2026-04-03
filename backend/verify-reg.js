const mongoose = require('mongoose');
const Farmer = require('./src/models/Farmer');
const User = require('./src/models/User');
require('dotenv').config();

async function checkRegistration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const farmer = await Farmer.findOne({ 'personalDetails.mobileNumber': '9123456789' });
    if (farmer) {
      console.log('Farmer Found:');
      console.log(JSON.stringify(farmer, null, 2));
    } else {
      console.log('Farmer NOT found with mobile 9123456789');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRegistration();
