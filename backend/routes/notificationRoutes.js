const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Ensure they are logged in
const { 
  getNotifications, 
  getUnreadCount, 
  markAsRead 
} = require('../controllers/notificationController');
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read', protect, markAsRead);

module.exports = router;