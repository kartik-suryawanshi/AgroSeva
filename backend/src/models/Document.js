const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },

    docType: {
      type: String,
      enum: ['aadhaar', 'land_record', 'bank_passbook', 'crop_photo', 'income_certificate', 'caste_certificate', 'invoice', 'passport_photo', 'receipt', 'other'],
    },

    originalFileName: String,
    cloudinaryPublicId: String,
    cloudinaryUrl: String,
    fileSize: Number,
    mimeType: String,

    ocrData: {
      rawText: String,
      extractedFields: Object,
      confidence: Number,
      processedAt: Date,
      ocrEngine: String,
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'mismatch', 're_upload_required'],
      default: 'pending',
      index: true,
    },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    verificationRemarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
