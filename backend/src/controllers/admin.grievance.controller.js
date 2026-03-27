const Grievance = require('../models/Grievance');
const redisClient = require('../config/redis');
const { Queue } = require('bullmq');

let notifQueue = null;
try {
  notifQueue = new Queue('send-notification', { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });
} catch (e) { /* BullMQ unavailable */ }

// Helper to invalidate admin dashboard cache
const invalidateDashboardCache = async () => {
  if (!redisClient.isReady) return;
  try {
    const keys = await redisClient.keys('admin:dashboard:*');
    if (keys.length > 0) await redisClient.del(keys);
  } catch (_) { /* Redis unavailable */ }
};

exports.getGrievances = async (req, res) => {
  const { status, priority, category, isSlaBreach, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (isSlaBreach !== undefined) query.isSlaBreach = isSlaBreach === 'true';

  const grievances = await Grievance.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'farmerId', select: 'personalDetails.fullName address.district' },
      { path: 'assignedOfficer', select: 'role' }
    ],
    sort: { priority: -1, createdAt: 1 }, // High priority first, then oldest
  });

  res.status(200).json({ success: true, ...grievances });
};

exports.replyToGrievance = async (req, res) => {
  const { message, isInternal, newStatus } = req.body;

  const grievance = await Grievance.findById(req.params.grievanceId);
  if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

  grievance.conversation.push({
    authorId: req.user._id,
    authorRole: req.user.role,
    message,
    isInternal: isInternal || false,
  });

  if (newStatus) {
    res.locals.previousState = { status: grievance.status };
    res.locals.newState = { status: newStatus };
    grievance.status = newStatus;

    if (newStatus === 'resolved' || newStatus === 'closed') {
      grievance.resolvedAt = new Date();
      grievance.resolvedBy = req.user._id;
      // If resolved before SLA deadline, it is NOT a breach
      if (new Date() <= grievance.slaDeadline) {
         grievance.isSlaBreach = false; 
      }
    }
  }

  res.locals.resourceId = grievance._id;

  await grievance.save();
  await invalidateDashboardCache();

  // Notify farmer if message is public
  if (!isInternal) {
    await notifQueue.add('send', {
      recipientId: grievance.farmerId,
      type: 'grievance_update',
      title: 'Update on your Grievance',
      message: `An official has replied to your grievance ${grievance.grievanceId}.`,
      channels: ['in_app']
    });
  }

  res.status(200).json({ success: true, message: 'Reply added', data: grievance });
};

exports.assignGrievance = async (req, res) => {
  const { assignedOfficer, assignedDepartment } = req.body;

  const grievance = await Grievance.findByIdAndUpdate(
    req.params.grievanceId,
    { assignedOfficer, assignedDepartment },
    { new: true }
  );

  res.locals.resourceId = grievance._id;
  res.locals.newState = { assignedOfficer, assignedDepartment };

  await invalidateDashboardCache();

  res.status(200).json({ success: true, data: grievance });
};
