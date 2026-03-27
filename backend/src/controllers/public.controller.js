const Farmer = require('../models/Farmer');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');

exports.getDashboardOverview = async (req, res) => {
  const now = new Date();

  const [
    totalFarmers,
    schemesActive,
    claimsProcessed,
    grievancesResolved,
    totalGrievances,
  ] = await Promise.all([
    Farmer.countDocuments({}),
    Scheme.countDocuments({
      status: 'active',
      'timeline.applicationEndDate': { $gte: now },
    }),
    Application.countDocuments({
      status: { $in: ['approved', 'disbursed', 'eligible', 'rejected', 'ineligible', 'cancelled'] },
    }),
    Grievance.countDocuments({
      status: { $in: ['resolved', 'closed'] },
    }),
    Grievance.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalFarmers,
      schemesActive,
      claimsProcessed,
      grievancesResolved,
      grievancesResolvedRate: totalGrievances ? Math.round((grievancesResolved / totalGrievances) * 100) : 0,
    },
  });
};

exports.getActiveSchemeCategories = async (req, res) => {
  const now = new Date();
  const categories = await Scheme.distinct('category', {
    status: 'active',
    'timeline.applicationEndDate': { $gte: now },
  });

  res.status(200).json({ success: true, data: { categories } });
};

