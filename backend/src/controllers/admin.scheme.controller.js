const Scheme = require('../models/Scheme');
const { Queue } = require('bullmq');

const batchReevalQueue = new Queue('batch-eligibility-reeval', { connection: { url: process.env.BULL_REDIS_URL || 'redis://localhost:6379' } });

exports.getSchemes = async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { schemeName: { $regex: search, $options: 'i' } },
      { schemeCode: { $regex: search, $options: 'i' } },
    ];
  }

  const schemes = await Scheme.paginate(query, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
  });

  res.status(200).json({ success: true, ...schemes });
};

exports.createScheme = async (req, res) => {
  const schemeData = req.body;
  schemeData.createdBy = req.user._id;
  schemeData.status = 'draft';
  schemeData.schemeCode = `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const scheme = await Scheme.create(schemeData);

  res.locals.resourceId = scheme._id;
  res.locals.newState = { status: 'draft', code: scheme.schemeCode };

  res.status(201).json({ success: true, message: 'Scheme created', data: scheme });
};

exports.updateScheme = async (req, res) => {
  const scheme = await Scheme.findById(req.params.schemeId);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  // Only check for criteria changes if the scheme has active applications, but we can do it unconditionally
  const previousCriteria = JSON.stringify(scheme.eligibilityCriteria);

  Object.assign(scheme, req.body);
  scheme.lastModifiedBy = req.user._id;

  await scheme.save();

  const currentCriteria = JSON.stringify(scheme.eligibilityCriteria);
  let batchStarted = false;

  // If eligibility changed and there are actual applied people, trigger batch re-evaluation
  if (previousCriteria !== currentCriteria && scheme.applicationCount > 0) {
    await batchReevalQueue.add('reevaluate', { schemeId: scheme._id });
    batchStarted = true;
  }

  res.locals.resourceId = scheme._id;
  res.locals.newState = { lastModifiedBy: req.user._id };

  res.status(200).json({
    success: true,
    message: batchStarted ? 'Scheme updated and batch re-evaluation triggered' : 'Scheme updated',
    data: scheme
  });
};

exports.publishScheme = async (req, res) => {
  const scheme = await Scheme.findById(req.params.schemeId);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  // Validate required fields
  if (!scheme.schemeName || !scheme.timeline || !scheme.timeline.applicationEndDate) {
    return res.status(400).json({ success: false, message: 'Missing required timeline or naming fields to publish' });
  }

  scheme.status = 'active';
  scheme.lastModifiedBy = req.user._id;

  await scheme.save();

  res.locals.resourceId = scheme._id;
  res.locals.previousState = { status: 'draft' };
  res.locals.newState = { status: 'active' };

  res.status(200).json({ success: true, message: 'Scheme published and active', data: scheme });
};
