const { z } = require('zod');
const Farmer = require('../models/Farmer');
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');

exports.getProfile = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id })
    .populate('documents')
    .lean();
    
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer profile not found' });
  }

  const applicationsCount = await Application.countDocuments({ farmerId: farmer._id });

  res.status(200).json({ success: true, data: { ...farmer, applicationsCount } });
};

exports.updateProfile = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) return res.status(404).json({ success: false, message: 'Profile not found' });

  const { personalDetails, address, landDetails, bankDetails } = req.body;

  if (personalDetails) Object.assign(farmer.personalDetails, personalDetails);
  if (address) Object.assign(farmer.address, address);
  if (landDetails) Object.assign(farmer.landDetails, landDetails);
  if (bankDetails) Object.assign(farmer.bankDetails, bankDetails);

  // Recalculate profile completion (rough example of 20 core fields)
  let filledFields = 0;
  const coreFields = [
    farmer.personalDetails?.fullName, farmer.personalDetails?.dateOfBirth, farmer.personalDetails?.gender,
    farmer.personalDetails?.aadhaarNumber, farmer.personalDetails?.casteCategory, farmer.personalDetails?.mobileNumber,
    farmer.address?.village, farmer.address?.district, farmer.address?.state, farmer.address?.pincode,
    farmer.landDetails?.totalLandAcres, farmer.landDetails?.landType, farmer.landDetails?.ownershipType,
    farmer.landDetails?.primaryCrop, farmer.landDetails?.irrigationSource,
    farmer.bankDetails?.bankName, farmer.bankDetails?.accountNumber, farmer.bankDetails?.ifscCode,
    farmer.annualIncome
  ];
  
  coreFields.forEach(f => { if (f) filledFields++; });
  farmer.profileCompletionPercent = Math.round((filledFields / 19) * 100);
  farmer.isProfileComplete = farmer.profileCompletionPercent === 100;

  await farmer.save();

  res.status(200).json({ success: true, message: 'Profile updated', data: farmer });
};

exports.getDashboard = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id }).lean();
  if (!farmer) return res.status(404).json({ success: false, message: 'Profile not found' });

  const [
    applicationsAggr,
    recentApplications,
    latestGrievance,
    notifications
  ] = await Promise.all([
    Application.aggregate([
      { $match: { farmerId: farmer._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.find({ farmerId: farmer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('schemeId', 'schemeName category'),
    Grievance.findOne({ farmerId: farmer._id })
      .sort({ createdAt: -1 }),
    Notification.find({ recipientId: req.user._id, isRead: false })
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  const applicationsStatus = applicationsAggr.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      profileCompletionPercent: farmer.profileCompletionPercent || 0,
      applications: applicationsStatus,
      recentApplications,
      latestGrievance,
      notifications
    }
  });
};
