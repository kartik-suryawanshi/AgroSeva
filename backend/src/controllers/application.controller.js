const { z } = require('zod');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const Farmer = require('../models/Farmer');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

// Helper to invalidate admin dashboard cache so officials see real-time updates
const invalidateDashboardCache = async () => {
  if (!redisClient.isReady) return;
  try {
    const keys = await redisClient.keys('admin:dashboard:*');
    if (keys.length > 0) await redisClient.del(keys);
  } catch (_) { /* Redis unavailable */ }
};

const config = require('../config');

const notifQueue = new Queue('send-notification', { 
  connection: { 
    url: config.redis.url,
    tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined
  } 
});

exports.submitApplication = async (req, res) => {
  const { schemeId, documents, formData } = req.body;
  if (!schemeId) return res.status(400).json({ success: false, message: 'schemeId is required' });

  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer profile not found' });

  const scheme = await Scheme.findById(schemeId).lean();
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  if (scheme.status !== 'active' || new Date() > new Date(scheme.timeline.applicationEndDate)) {
    return res.status(400).json({ success: false, message: 'Scheme is not active or deadline has passed' });
  }

  const existing = await Application.findOne({ farmerId: farmer._id, schemeId, status: { $ne: 'rejected' } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An active application for this scheme already exists' });
  }

  // Persist optional frontend overrides so eligibility + submission reflect the latest values.
  if (formData) {
    const mapLandType = (lt) => {
      if (!lt) return undefined;
      const s = String(lt).toLowerCase();
      if (s.includes('irrig')) return 'irrigated';
      if (s.includes('rain')) return 'unirrigated';
      if (s.includes('forest')) return 'forest';
      if (s === 'unirrigated' || s === 'irrigated' || s === 'forest') return s;
      return undefined;
    };

    const { personalDetails, landDetails } = formData;

    if (personalDetails?.aadhaarNumber) farmer.personalDetails.aadhaarNumber = personalDetails.aadhaarNumber;
    if (personalDetails?.bankAccount) farmer.bankDetails.accountNumber = personalDetails.bankAccount;
    if (personalDetails?.ifsc) farmer.bankDetails.ifscCode = personalDetails.ifsc;
    if (personalDetails?.beneficiaryName) farmer.bankDetails.accountHolderName = personalDetails.beneficiaryName;

    if (landDetails?.surveyNo) farmer.landDetails.surveyNumber = landDetails.surveyNo;
    if (landDetails?.landArea !== undefined && landDetails?.landArea !== null && landDetails?.landArea !== '') {
      const n = Number(landDetails.landArea);
      if (!Number.isNaN(n)) farmer.landDetails.totalLandAcres = n;
    }

    if (landDetails?.landType) {
      const mapped = mapLandType(landDetails.landType);
      if (mapped) farmer.landDetails.landType = mapped;
    }

    if (landDetails?.cropGrown) farmer.landDetails.primaryCrop = landDetails.cropGrown;
    if (landDetails?.district) farmer.address.district = landDetails.district;

    await farmer.save();
  }

  const result = evaluateEligibility(farmer.toObject ? farmer.toObject() : farmer, scheme);
  
  // Set initial status based on engine output
  let initialStatus = 'submitted';
  if (!result.isEligible && result.summary.mandatoryFailed.length > 0) {
    initialStatus = 'ineligible';
  }

  // --- SMART AUTOMATED OFFICER ROUTING ---
  const User = require('../models/User');
  const officials = await User.find({ role: 'official', isActive: true }, '_id');
  let bestOfficialId = null;

  if (officials.length > 0) {
    const workloads = await Application.aggregate([
      { $match: { assignedOfficer: { $in: officials.map(o => o._id) }, status: { $in: ['submitted', 'under_review', 'documents_pending'] } } },
      { $group: { _id: '$assignedOfficer', count: { $sum: 1 } } },
      { $sort: { count: 1 } }
    ]);
    
    if (workloads.length < officials.length) {
      const busyOfficialIds = workloads.map(w => w._id.toString());
      bestOfficialId = officials.find(o => !busyOfficialIds.includes(o._id.toString()))._id;
    } else if (workloads.length > 0) {
      bestOfficialId = workloads[0]._id;
    }
  }
  // -----------------------------------------

  const appId = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const application = await Application.create({
    applicationId: appId,
    farmerId: farmer._id,
    schemeId: scheme._id,
    submittedData: {
      landDetails: farmer.landDetails,
      cropDetails: { primaryCrop: farmer.landDetails?.primaryCrop, secondaryCrop: farmer.landDetails?.secondaryCrop },
      bankDetails: farmer.bankDetails,
      personalDetails: farmer.personalDetails,
    },
    documents: documents || [],
    eligibilityResult: {
      ...result,
      evaluatedBy: 'system',
    },
    status: initialStatus,
    timeline: [
      {
        stage: 'Application Submitted',
        completedAt: new Date(),
        remarks: 'Auto-submitted via portal',
      }
    ],
    assignedOfficer: bestOfficialId,
  });

  await Scheme.findByIdAndUpdate(schemeId, { $inc: { applicationCount: 1 } });

  // IMPORTANT: Link the newly appended application ID to the documents so they appear in the Document Verification Center
  if (documents && documents.length > 0) {
    const DocumentModel = require('../models/Document');
    await DocumentModel.updateMany(
      { _id: { $in: documents } },
      { $set: { applicationId: application._id } }
    );
  }

  // Use res.locals to pass resources to auditLog middleware
  res.locals.resourceId = application._id;
  res.locals.previousState = null;
  res.locals.newState = { status: application.status, score: result.score };

  // Enqueue notification job
  await notifQueue.add('send', {
    recipientId: req.user._id,
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application ${appId} for ${scheme.schemeName} has been received.`,
    data: { applicationId: application._id },
    channels: ['in_app', 'sms']
  });

  // Ensure officials dashboard immediately reflects this new application
  await invalidateDashboardCache();

  res.status(201).json({ success: true, message: 'Application submitted', data: application });
};

exports.getApplications = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  const applications = await Application.find({ farmerId: farmer._id })
    .populate('schemeId', 'schemeName schemeCode category')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: applications });
};

exports.getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.applicationId)
    .populate('schemeId')
    .populate('documents');
    
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  // Access check
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (application.farmerId.toString() !== farmer._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.status(200).json({ success: true, data: application });
};
