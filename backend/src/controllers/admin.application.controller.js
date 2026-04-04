const Application = require('../models/Application');
const Document = require('../models/Document');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const redisClient = require('../config/redis');
const { Queue } = require('bullmq');

let notifQueue = null;
try {
  notifQueue = new Queue('send-notification', { 
    connection: { 
      url: config.redis.url,
      tls: config.redis.url.startsWith('rediss://') || config.redis.url.includes('upstash.io') ? {} : undefined
    } 
  });
} catch (e) { /* BullMQ unavailable */ }

// Helper to invalidate admin dashboard cache
const invalidateDashboardCache = async () => {
  if (!redisClient.isReady) return;
  try {
    const keys = await redisClient.keys('admin:dashboard:*');
    if (keys.length > 0) await redisClient.del(keys);
  } catch (_) { /* Redis unavailable */ }
};

exports.getApplications = async (req, res) => {
  const { status, schemeId, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (schemeId) query.schemeId = schemeId;
  // If search implies an application ID
  if (search && search.startsWith('APP-')) query.applicationId = search;

  const applications = await Application.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'farmerId', select: 'personalDetails.fullName address.district farmerId' },
      { path: 'schemeId', select: 'schemeName schemeCode' },
      { path: 'assignedOfficer', select: 'role' }
    ],
    sort: { createdAt: -1 }
  });

  res.status(200).json({ success: true, ...applications });
};

exports.getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.applicationId)
    .populate('farmerId')
    .populate('schemeId')
    .populate('documents')
    .populate('assignedOfficer', 'role');

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  
  res.status(200).json({ success: true, data: application });
};

exports.updateStatus = async (req, res) => {
  const { status, remarks, rejectionReason } = req.body;
  
  const application = await Application.findById(req.params.applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  // Disallow reverse transitions from approved/disbursed unless system admin
  if ((application.status === 'approved' || application.status === 'disbursed') && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Cannot demote status of a finalized application' });
  }

  res.locals.resourceId = application._id;
  res.locals.previousState = { status: application.status };
  res.locals.newState = { status };

  application.status = status;
  if (remarks) application.reviewRemarks = remarks;
  if (rejectionReason && status === 'rejected') application.rejectionReason = rejectionReason;

  application.timeline.push({
    stage: `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
    completedAt: new Date(),
    completedBy: req.user._id,
    remarks: remarks || `Status transition to ${status}`,
  });

  await application.save();

  await invalidateDashboardCache();

  // Notify farmer
  if (status === 'approved' || status === 'rejected') {
    await notifQueue.add('send', {
      recipientId: application.farmerId,
      type: `application_${status}`,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your application ${application.applicationId} has been ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      channels: ['in_app', 'sms']
    });
  }

  res.status(200).json({ success: true, message: 'Status updated', data: application });
};

exports.assignApplication = async (req, res) => {
  const { officialId } = req.body;
  const application = await Application.findByIdAndUpdate(
    req.params.applicationId,
    { assignedOfficer: officialId },
    { new: true }
  );

  res.locals.resourceId = application._id;
  res.locals.newState = { assignedOfficer: officialId };

  res.status(200).json({ success: true, data: application });
};

exports.eligibilityOverride = async (req, res) => {
  const { criterionName, overrideValue, overrideReason } = req.body;

  const application = await Application.findById(req.params.applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  const criterionIndex = application.eligibilityResult.criteriaResults.findIndex(c => c.criterion === criterionName);
  if (criterionIndex === -1) return res.status(404).json({ success: false, message: 'Criterion not found in eligibility result' });

  // Apply override
  application.eligibilityResult.criteriaResults[criterionIndex].passed = overrideValue;
  application.eligibilityResult.criteriaResults[criterionIndex].message += ` [OVERRIDE by Official: ${overrideReason}]`;
  application.eligibilityResult.evaluatedBy = 'official';

  // Recalculate score natively
  let recalculatedScore = 0;
  let totalWeight = 0;
  application.eligibilityResult.criteriaResults.forEach(c => {
    totalWeight += c.weight;
    if (c.passed) recalculatedScore += c.weight;
  });

  application.eligibilityResult.score = Math.round((recalculatedScore / totalWeight) * 100);

  res.locals.resourceId = application._id;
  res.locals.previousState = { score: application.eligibilityResult.score };
  res.locals.newState = { override: criterionName, newValue: overrideValue };

  await application.save();
  await invalidateDashboardCache();

  res.status(200).json({ success: true, message: 'Override applied and score recalculated', data: application });
};

exports.getPendingDocuments = async (req, res) => {
  const documents = await Document.find({ verificationStatus: 'pending' })
    .populate('farmerId', 'personalDetails.fullName')
    .populate('applicationId', 'applicationId')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: documents });
};

exports.verifyDocument = async (req, res) => {
  const { verificationStatus, verificationRemarks, correctedFields } = req.body;

  const document = await Document.findByIdAndUpdate(
    req.params.documentId,
    {
      verificationStatus,
      verificationRemarks,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      ...(correctedFields && { 'ocrData.extractedFields': correctedFields })
    },
    { new: true }
  );

  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

  res.locals.resourceId = document._id;
  res.locals.newState = { status: verificationStatus };

  res.status(200).json({ success: true, message: 'Document verified', data: document });
};
