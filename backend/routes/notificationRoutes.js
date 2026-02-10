const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getNotifications, 
  getUnreadCount, 
  markAsRead 
} = require('../controllers/notificationController'); // Double check this line!

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read', protect, markAsRead);

module.exports = router;