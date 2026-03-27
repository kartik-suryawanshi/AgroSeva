const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'application_submitted',
        'application_approved',
        'application_rejected',
        'document_verified',
        'grievance_update',
        'scheme_deadline',
        'insurance_update',
        'system_alert',
      ],
    },
    title: String,
    message: String,
    data: Object,
    channel: [{ type: String, enum: ['in_app', 'sms', 'email'] }],
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    sentAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
