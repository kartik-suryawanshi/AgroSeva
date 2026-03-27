const { z } = require('zod');
const Scheme = require('../models/Scheme');
const Farmer = require('../models/Farmer');
const { evaluateEligibility } = require('../services/eligibilityEngine');

exports.getSchemes = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  const query = {
    status: 'active',
    'timeline.applicationEndDate': { $gte: new Date() },
  };

  if (category) query.category = category;
  if (search) query.schemeName = { $regex: search, $options: 'i' };

  const schemes = await Scheme.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { 'timeline.applicationEndDate': 1 }
  });

  res.status(200).json({ success: true, ...schemes });
};

exports.getSchemeById = async (req, res) => {
  const scheme = await Scheme.findById(req.params.schemeId);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  
  res.status(200).json({ success: true, data: scheme });
};

exports.checkEligibility = async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id }).lean();
  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer profile not found' });

  const scheme = await Scheme.findById(req.params.schemeId).lean();
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  // Optional form overrides from the frontend: we evaluate using the entered values,
  // without persisting them to the database.
  const overrides = req.body?.formData;
  if (overrides) {
    const mapLandType = (lt) => {
      if (!lt) return undefined;
      const s = String(lt).toLowerCase();
      if (s.includes('irrig')) return 'irrigated';
      if (s.includes('rain')) return 'unirrigated';
      if (s.includes('forest')) return 'forest';
      if (s === 'unirrigated' || s === 'irrigated' || s === 'forest') return s;
      return undefined;
    };

    const { personalDetails, landDetails } = overrides;

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
  }

  const result = evaluateEligibility(farmer, scheme);

  res.status(200).json({ success: true, data: result });
};
