const express = require('express');
const router = express.Router();
const { getPendingArtisans, verifyArtisan } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only users with 'admin' role can access these
router.get('/pending', protect, authorize('admin'), getPendingArtisans);
router.put('/verify/:id', protect, authorize('admin'), verifyArtisan);

module.exports = router;