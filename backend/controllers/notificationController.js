const Notification = require('../models/Notification');
const Message = require('../models/Message'); // Make sure this file exists!
// @desc    Get user notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
exports.getUnreadCount = async (req, res) => {
  try {
    const notifCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });
    
    const msgCount = await Message.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });

    res.json({ notifications: notifCount, messages: msgCount });
  } catch (err) {
    res.status(500).json({ message: "Error counting unread items" });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};