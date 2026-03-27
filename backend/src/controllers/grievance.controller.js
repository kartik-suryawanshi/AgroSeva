const Grievance = require('../models/Grievance');
const Farmer = require('../models/Farmer');
const { Queue } = require('bullmq');

const nlpQueue = new Queue('nlp-analyze', { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });

exports.submitGrievance = async (req, res) => {
  const { category, subject, description, relatedApplicationId, attachments } = req.body;
  if (!category || !subject || !description) {
    return res.status(400).json({ success: false, message: 'Category, subject, and description required' });
  }

  const farmer = await Farmer.findOne({ userId: req.user._id });

  const priorityDefaults = {
    officer_misconduct: 'high',
    wrong_rejection: 'high',
    insurance_issue: 'medium',
    subsidy_delay: 'medium',
    land_record_error: 'low',
    scheme_query: 'low',
    other: 'low'
  };

  const priority = priorityDefaults[category] || 'medium';
  
  // High = 3 days, Med = 7 days, Low = 14 days
  const slaDays = priority === 'high' ? 3 : priority === 'medium' ? 7 : 14;
  const slaDeadline = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000);

  const grievanceId = `GRV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const grievance = await Grievance.create({
    grievanceId,
    farmerId: farmer._id,
    relatedApplicationId,
    category,
    subject,
    description,
    attachments: attachments || [],
    priority,
    slaDeadline,
    status: 'open',
    conversation: [
      {
        authorId: req.user._id,
        authorRole: 'farmer',
        message: description,
        isInternal: false,
      }
    ]
  });

  res.locals.resourceId = grievance._id;
  res.locals.newState = { status: 'open' };

  await nlpQueue.add('analyze', { grievanceId: grievance._id });

  res.status(201).json({ success: true, message: 'Grievance submitted successfully', data: grievance });
};

exports.getGrievances = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  
  const grievances = await Grievance.find({ farmerId: farmer._id })
    .populate('relatedApplicationId', 'applicationId schemeId')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: grievances });
};

exports.getGrievanceById = async (req, res) => {
  const grievance = await Grievance.findById(req.params.grievanceId)
    .populate('attachments')
    .populate('conversation.authorId', 'personalDetails.fullName role');

  if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

  // Access check
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (grievance.farmerId.toString() !== farmer._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Filter out internal notes for the farmer
  grievance.conversation = grievance.conversation.filter(msg => !msg.isInternal);

  res.status(200).json({ success: true, data: grievance });
};
