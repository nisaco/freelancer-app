const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:recipientId', protect, getMessages);
router.post('/', protect, sendMessage);
router.get('/inbox', protect, getInbox);

module.exports = router;