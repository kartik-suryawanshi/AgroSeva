const mongoose = require('mongoose');

const reportsCacheSchema = new mongoose.Schema(
  {
    reportType: { type: String, index: true },
    parameters: Object,
    data: Object,
    generatedAt: Date,
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportsCache', reportsCacheSchema);
