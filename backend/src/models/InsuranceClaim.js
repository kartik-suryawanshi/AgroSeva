const mongoose = require('mongoose');

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimId: { type: String, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', index: true },
    policyNumber: String,

    cropDetails: {
      cropName: String,
      season: String,
      sowingDate: Date,
      affectedAreaAcres: Number,
    },

    damageDetails: {
      damageType: { type: String, enum: ['flood', 'drought', 'pest', 'hail', 'fire', 'other'] },
      estimatedLossPercent: Number,
      damageDate: Date,
      description: String,
    },

    evidenceDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

    aiVerification: {
      isVerified: Boolean,
      confidenceScore: Number,
      weatherDataMatch: Boolean,
      cropCalendarMatch: Boolean,
      remarks: String,
      verifiedAt: Date,
    },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'disbursed'],
      default: 'submitted',
      index: true,
    },

    approvedAmount: Number,
    rejectionReason: String,
    disbursementDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('InsuranceClaim', insuranceClaimSchema);
