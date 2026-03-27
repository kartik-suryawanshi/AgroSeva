const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const query = { recipientId: req.user._id };
  
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    
  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    data: notifications,
    meta: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

  res.status(200).json({ success: true, data: notification });
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
};
