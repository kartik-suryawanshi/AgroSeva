const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User'); // Adjust path based on execution dir

require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const existingAdmin = await User.findOne({ mobileNumber: '0000000000' });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      mobileNumber: '0000000000',
      passwordHash: hashedPassword,
      fullName: 'System Admin',
      role: 'admin',
      isVerified: true
    });

    console.log("Admin user created! Login with 0000000000 / admin123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
