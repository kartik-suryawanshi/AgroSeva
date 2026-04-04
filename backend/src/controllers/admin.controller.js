const config = require('../config');

let reportQueue = null;
try {
  reportQueue = new Queue('generate-report', { 
    connection: { 
      url: config.redis.url,
      tls: config.redis.url.startsWith('rediss://') ? {} : undefined
    } 
  });
} catch (e) {
  // BullMQ unavailable without Redis
}

exports.getDashboard = async (req, res) => {
  const officialId = req.user._id.toString();
  const cacheKey = `admin:dashboard:${officialId}`;

  // Try fetching from Redis (skip if unavailable)
  try {
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, fromCache: true, data: JSON.parse(cachedData) });
      }
    }
  } catch (_) { /* Redis unavailable, proceed without cache */ }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 7);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Parallel Aggregations (10 pipelines)
  const [
    todayStatsAggr,
    weeklyTrendAggr,
    districtBreakdownAggr,
    schemeBreakdownAggr,
    statusDistributionAggr,
    openGrievancesCount,
    fraudFlagsRecords,
    recentActivityLogs,
    avgProcessingTimeAggr,
    disbursedAmountAggr
  ] = await Promise.all([
    // 1. todayStats
    Application.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    // 2. weeklyTrend
    Application.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // 3. districtBreakdown (Requires lookup to Farmer)
    Application.aggregate([
      { $lookup: { from: 'farmers', localField: 'farmerId', foreignField: '_id', as: 'farmer' } },
      { $unwind: '$farmer' },
      { $group: { _id: '$farmer.address.district', count: { $sum: 1 } } }
    ]),
    // 4. schemeBreakdown
    Application.aggregate([
      { $group: { _id: '$schemeId', count: { $sum: 1 } } },
      { $lookup: { from: 'schemes', localField: '_id', foreignField: '_id', as: 'scheme' } },
      { $unwind: '$scheme' },
      { $project: { schemeName: '$scheme.schemeName', count: 1 } }
    ]),
    // 5. statusDistribution
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    // 6. openGrievances
    Grievance.aggregate([
      { $match: { status: { $in: ['open', 'in_progress'] } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    // 7. fraudFlags
    Application.find({ 'fraudFlags.0': { $exists: true } }).sort({ createdAt: -1 }).limit(10).populate('farmerId', 'personalDetails.fullName'),
    
    // 8. recentActivity
    AuditLog.find().sort({ createdAt: -1 }).limit(20).populate('actorId', 'mobileNumber role'),

    // 9. avgProcessingTime (approximated via timeline)
    Application.aggregate([
      { $match: { status: 'approved' } },
      { $project: {
          durationMs: { 
            $subtract: [
              { $arrayElemAt: ['$timeline.completedAt', -1] },
              { $arrayElemAt: ['$timeline.completedAt', 0] }
            ]
          }
        }
      },
      { $group: { _id: null, avgMs: { $avg: '$durationMs' } } }
    ]),
    // 10. disbursedAmount
    Application.aggregate([
      { $match: { status: 'disbursed', disbursementDate: { $gte: startOfMonth } } },
      { $group: { _id: null, totalFormatted: { $sum: '$disbursementAmount' } } }
    ])
  ]);

  const dashboardData = {
    todayStats: todayStatsAggr,
    weeklyTrend: weeklyTrendAggr,
    districtBreakdown: districtBreakdownAggr,
    schemeBreakdown: schemeBreakdownAggr,
    statusDistribution: statusDistributionAggr,
    openGrievances: openGrievancesCount,
    fraudFlags: fraudFlagsRecords,
    recentActivity: recentActivityLogs,
    avgProcessingTimeDays: avgProcessingTimeAggr.length ? (avgProcessingTimeAggr[0].avgMs / (1000 * 60 * 60 * 24)).toFixed(1) : 0,
    disbursedAmountMonth: disbursedAmountAggr.length ? disbursedAmountAggr[0].totalFormatted : 0,
  };

  // Cache for 5 minutes (skip if Redis unavailable)
  try {
    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(dashboardData), 'EX', 300);
    }
  } catch (_) { /* Redis unavailable */ }

  res.status(200).json({ success: true, fromCache: false, data: dashboardData });
};

exports.getAnalytics = async (req, res) => {
  try {
    const ApplicationModel = require('../models/Application');
    const SchemeModel = require('../models/Scheme');
    const GrievanceModel = require('../models/Grievance');

    // 1. Applications over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appsOverTime = await ApplicationModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "disbursed"]] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Applications by Scheme
    const appsByScheme = await ApplicationModel.aggregate([
      { $group: { _id: "$schemeId", count: { $sum: 1 } } },
      { $lookup: { from: 'schemes', localField: '_id', foreignField: '_id', as: 'scheme' } },
      { $unwind: "$scheme" },
      { $project: { name: "$scheme.schemeName", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Status Distribution
    const statusDist = await ApplicationModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 4. Grievance status
    const grievances = await GrievanceModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const data = {
      trend: appsOverTime,
      byScheme: appsByScheme,
      applicationsStatus: statusDist,
      grievancesStatus: grievances
    };

    res.status(200).json({ success: true, message: 'Analytics generated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate analytics', error: err.message });
  }
};

exports.getPredictions = async (req, res) => {
  const forecastDays = req.query.forecastDays || 30;
  
  // Build 90-day history for the prediction model
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const history = await Application.aggregate([
    { $match: { createdAt: { $gte: ninetyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const historicalData = history.map(h => ({ date: h._id, count: h.count }));

  try {
    const aiUrl = config.aiService.url;
    const response = await axios.post(`${aiUrl}/predict`, { forecastDays, historicalData });
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    if(!error.response) {
       // Python AI server might be offline locally
       return res.status(503).json({ success: false, message: 'AI forecast service currently unavailable.' });
    }
    return res.status(error.response.status).json({ success: false, message: 'AI processing failed' });
  }
};

exports.exportReport = async (req, res) => {
  const { reportType, dateFrom, dateTo, format } = req.body;
  
  if (!reportQueue) {
    return res.status(503).json({ success: false, message: 'Report queue unavailable (Redis not connected).' });
  }
  const job = await reportQueue.add('generate', { 
    reportType, dateFrom, dateTo, format, 
    requestedBy: req.user._id 
  });

  res.status(202).json({ success: true, jobId: job.id });
};

exports.getExportStatus = async (req, res) => {
  if (!reportQueue) {
    return res.status(503).json({ success: false, message: 'Report queue unavailable (Redis not connected).' });
  }
  const job = await reportQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const state = await job.getState();
  if (state === 'completed') {
    return res.status(200).json({ success: true, status: state, downloadUrl: job.returnvalue?.downloadUrl });
  }
  
  res.status(200).json({ success: true, status: state });
};
