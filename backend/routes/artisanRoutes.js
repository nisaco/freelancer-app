const express = require('express');
const router = express.Router();
const { updateProfile, getArtisans, getCurrentProfile } = require('../controllers/artisanController');
const { protect } = require('../middleware/authMiddleware');

// Route for getting current profile
router.get('/me', protect, getCurrentProfile);

// Route for creating/updating profile
router.post('/profile', protect, updateProfile);

// Route for getting all artisans
router.get('/', getArtisans);

module.exports = router;