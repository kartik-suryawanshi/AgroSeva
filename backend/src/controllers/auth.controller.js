const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const { sendSMS } = require('../utils/sms');

const generateTokenPair = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  const schema = z.object({
    mobileNumber: z.string().min(10).max(15),
    password: z.string().min(6),
    fullName: z.string().min(2),
    role: z.enum(['farmer', 'official', 'admin']).default('farmer'),
  });

  const { mobileNumber, password, fullName, role } = schema.parse(req.body);

  let user = await User.findOne({ mobileNumber });
  if (user && user.isVerified) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  if (!user) {
    user = new User({ mobileNumber, passwordHash, role, otpHash, otpExpiry });
  } else {
    user.passwordHash = passwordHash;
    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
  }

  await user.save();

  if (role === 'farmer') {
    const existingFarmer = await Farmer.findOne({ userId: user._id });
    if (!existingFarmer) {
      const farmerId = `AGR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      await Farmer.create({ userId: user._id, farmerId, personalDetails: { fullName, mobileNumber } });
    }
  }

  await sendSMS(mobileNumber, `Your AgroSeva OTP is ${otp}. Valid for 10 minutes.`);

  res.status(200).json({ success: true, message: 'OTP sent', userId: user._id });
};

exports.verifyOtp = async (req, res) => {
  const schema = z.object({
    userId: z.string(),
    otp: z.string().length(6),
  });

  const { userId, otp } = schema.parse(req.body);

  const user = await User.findById(userId);
  if (!user || !user.otpHash) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  const isMatch = await bcrypt.compare(otp, user.otpHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiry = undefined;

  const { accessToken, refreshToken } = generateTokenPair(user._id);
  
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  let profile = null;
  if (user.role === 'farmer') {
    profile = await Farmer.findOne({ userId: user._id }).lean();
  }

  res.status(200).json({
    success: true,
    message: 'Verification successful',
    accessToken,
    refreshToken,
    user: { id: user._id, role: user.role, mobileNumber: user.mobileNumber },
    profile,
  });
};

exports.login = async (req, res) => {
  const schema = z.object({
    mobileNumber: z.string().min(10),
    password: z.string().min(6),
  });

  const { mobileNumber, password } = schema.parse(req.body);

  const user = await User.findOne({ mobileNumber });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(401).json({ success: false, message: 'Account locked. Try again later.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lockout
    }
    await user.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ success: false, message: 'Account not verified. Please request OTP.' });
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const { accessToken, refreshToken } = generateTokenPair(user._id);

  user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > Date.now());
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  let profile = null;
  if (user.role === 'farmer') {
    profile = await Farmer.findOne({ userId: user._id }).lean();
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: { id: user._id, role: user.role, mobileNumber: user.mobileNumber },
    profile,
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    const tokenExists = user.refreshTokens.find(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' });
    }

    const newTokens = generateTokenPair(user._id);

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken && rt.expiresAt > Date.now());
    user.refreshTokens.push({
      token: newTokens.refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.status(200).json({ success: true, ...newTokens });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (req.user && refreshToken) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      await user.save();
    }
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
