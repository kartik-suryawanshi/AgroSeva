const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const farmerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmerId: { type: String, unique: true },

    personalDetails: {
      fullName: String,
      dateOfBirth: Date,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      aadhaarNumber: { type: String, index: true },
      aadhaarVerified: Boolean,
      casteCategory: { type: String, enum: ['general', 'obc', 'sc', 'st'] },
      email: String,
      mobileNumber: String,
      profilePhoto: String,
    },

    address: {
      houseNo: String,
      village: String,
      tehsil: String,
      district: { type: String, index: true },
      state: { type: String, index: true },
      pincode: String,
    },

    landDetails: {
      surveyNumber: String,
      totalLandAcres: Number,
      landType: { type: String, enum: ['irrigated', 'unirrigated', 'forest'] },
      ownershipType: { type: String, enum: ['owned', 'leased', 'sharecrop'] },
      primaryCrop: String,
      secondaryCrop: String,
      irrigationSource: { type: String, enum: ['canal', 'borewell', 'rainwater', 'none'] },
    },

    bankDetails: {
      bankName: String,
      branchName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },

    annualIncome: Number,

    isProfileComplete: { type: Boolean, default: false },
    profileCompletionPercent: { type: Number, default: 0 },

    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

farmerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Farmer', farmerSchema);
