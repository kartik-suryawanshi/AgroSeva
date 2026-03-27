const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, unique: true },
    schemeName: String,
    category: { type: String, enum: ['subsidy', 'insurance', 'loan', 'equipment', 'input'], index: true },
    description: String,
    fundingSource: String,
    governmentOrderNumber: String,

    benefits: {
      benefitType: { type: String, enum: ['cash', 'input_subsidy', 'equipment', 'other'] },
      benefitAmount: Number,
      benefitUnit: String,
      paymentFrequency: { type: String, enum: ['one-time', 'annual', 'seasonal'] },
    },

    eligibilityCriteria: {
      farmerCategories: [{ type: String, enum: ['small', 'marginal', 'large', 'all'] }],
      maxLandAcres: Number,
      minLandAcres: Number,
      allowedCasteCategories: [String],
      allowedCrops: [String],
      minFarmingYears: Number,
      maxAnnualIncome: Number,
      minAge: Number,
      maxAge: Number,
      requiredLandType: [String],
      allowedStates: [String],
      customRules: [
        {
          field: String,
          operator: { type: String, enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'] },
          value: mongoose.Schema.Types.Mixed,
        },
      ],
    },

    requiredDocuments: [
      {
        docType: String,
        mandatory: Boolean,
        label: String,
      },
    ],

    timeline: {
      applicationStartDate: Date,
      applicationEndDate: { type: Date, index: true },
      expectedDisbursementDate: Date,
    },

    status: { type: String, enum: ['draft', 'active', 'paused', 'closed'], default: 'draft', index: true },

    applicationCount: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

schemeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Scheme', schemeSchema);
