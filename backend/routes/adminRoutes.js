const express = require('express');
const router = express.Router();
const { getAdminStats, verifyArtisan } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all stats and the pending list
router.get('/stats', protect, authorize('admin'), getAdminStats);

// Verify or Reject an artisan - FIXED LINE 9
router.put('/verify/:id', protect, authorize('admin'), verifyArtisan);

module.exports = router;