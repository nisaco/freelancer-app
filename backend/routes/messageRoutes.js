const express = require('express');
const router = express.Router();
// ADD getInbox HERE 👇
const { getMessages, sendMessage, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/inbox', protect, getInbox); // This line will stop crashing now
router.get('/:recipientId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;