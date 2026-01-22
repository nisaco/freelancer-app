const express = require('express');
const router = express.Router();
const { getAdminStats, verifyArtisan } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all stats and pending list
router.get('/stats', protect, authorize('admin'), getAdminStats);
// Verify/Reject route
router.put('/verify/:id', protect, authorize('admin'), verifyArtisan);

module.exports = router;