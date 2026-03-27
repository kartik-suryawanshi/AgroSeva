const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: { type: String, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    relatedApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

    category: {
      type: String,
      enum: ['subsidy_delay', 'wrong_rejection', 'officer_misconduct', 'insurance_issue', 'land_record_error', 'scheme_query', 'other'],
      index: true,
    },

    subject: String,
    description: String,
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    preferredResolutionDate: Date,

    nlpAnalysis: {
      detectedCategory: String,
      urgencyScore: Number,
      sentimentScore: Number,
      keywords: [String],
      processedAt: Date,
    },

    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },

    assignedDepartment: String,
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    status: {
      type: String,
      enum: ['open', 'in_progress', 'pending_info', 'escalated', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },

    conversation: [
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorRole: String,
        message: String,
        isInternal: Boolean,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    resolutionNotes: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionRating: Number,

    escalationHistory: [
      {
        escalatedTo: String,
        reason: String,
        at: Date,
      },
    ],

    slaDeadline: Date,
    isSlaBreach: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

grievanceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Grievance', grievanceSchema);
