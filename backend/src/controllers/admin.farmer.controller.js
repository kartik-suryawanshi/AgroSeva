const Farmer = require('../models/Farmer');
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');
const Document = require('../models/Document');
const Notification = require('../models/Notification');

exports.getFarmers = async (req, res) => {
  const { search, district, state, cropType, landSizeMin, landSizeMax, page = 1, limit = 20 } = req.query;

  const query = {};

  if (search) {
    query['$or'] = [
      { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
      { farmerId: { $regex: search, $options: 'i' } },
      { 'personalDetails.aadhaarNumber': search }
    ];
  }

  if (district) query['address.district'] = { $regex: new RegExp(`^${district}$`, 'i') };
  if (state) query['address.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
  
  if (cropType) {
    query['$or'] = [
      { 'landDetails.primaryCrop': { $regex: cropType, $options: 'i' } },
      { 'landDetails.secondaryCrop': { $regex: cropType, $options: 'i' } }
    ];
  }

  if (landSizeMin !== undefined || landSizeMax !== undefined) {
    query['landDetails.totalLandAcres'] = {};
    if (landSizeMin !== undefined) query['landDetails.totalLandAcres'].$gte = parseFloat(landSizeMin);
    if (landSizeMax !== undefined) query['landDetails.totalLandAcres'].$lte = parseFloat(landSizeMax);
  }

  const farmers = await Farmer.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: 'userId', // to get the mobile number if needed
    sort: { createdAt: -1 }
  });

  res.status(200).json({ success: true, ...farmers });
};

exports.getFarmerById = async (req, res) => {
  const farmer = await Farmer.findById(req.params.farmerId).populate('documents');
  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

  // Parallel fetch associated records
  const [applications, grievances, notifications] = await Promise.all([
    Application.find({ farmerId: farmer._id }).populate('schemeId', 'schemeName category'),
    Grievance.find({ farmerId: farmer._id }),
    Notification.find({ recipientId: farmer.userId }).sort({ createdAt: -1 }).limit(50)
  ]);

  res.status(200).json({
    success: true,
    data: {
      profile: farmer,
      applications,
      grievances,
      notifications
    }
  });
};
