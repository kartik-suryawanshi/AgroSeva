const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true, index: true },

    submittedData: {
      landDetails: Object,
      cropDetails: Object,
      bankDetails: Object,
      personalDetails: Object,
    },

    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

    eligibilityResult: {
      isEligible: Boolean,
      score: { type: Number, index: true },
      criteriaResults: [
        {
          criterion: String,
          passed: Boolean,
          farmerValue: mongoose.Schema.Types.Mixed,
          requiredValue: mongoose.Schema.Types.Mixed,
          message: String,
        },
      ],
      evaluatedAt: Date,
      evaluatedBy: { type: String, enum: ['system', 'official'] },
    },

    fraudFlags: [
      {
        flagType: String,
        reason: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        flaggedAt: Date,
      },
    ],

    status: {
      type: String,
      enum: ['submitted', 'documents_pending', 'under_review', 'eligible', 'ineligible', 'approved', 'rejected', 'disbursed', 'cancelled'],
      default: 'submitted',
      index: true,
    },

    timeline: [
      {
        stage: String,
        completedAt: Date,
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remarks: String,
      },
    ],

    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewRemarks: String,
    rejectionReason: String,
    disbursementDate: Date,
    disbursementAmount: Number,
    disbursementReference: String,
  },
  { timestamps: true }
);

// We need index on createdAt and combinations commonly queried
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ farmerId: 1, schemeId: 1 });

applicationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Application', applicationSchema);
