const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'official', 'admin'], default: 'farmer', index: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otpHash: String,
    otpExpiry: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: Date,
        expiresAt: Date,
      },
    ],
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
