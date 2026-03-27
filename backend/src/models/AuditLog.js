const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: String,
    action: String,
    resourceType: { type: String, index: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, index: true },
    previousState: Object,
    newState: Object,
    ipAddress: String,
    userAgent: String,
    metadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
