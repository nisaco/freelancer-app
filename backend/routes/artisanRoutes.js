const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  getArtisans, 
  getCurrentProfile 
} = require('../controllers/artisanController');
const { protect } = require('../middleware/authMiddleware');

// Fixed imports to prevent TypeError
router.get('/me', protect, getCurrentProfile); // Line 13
router.post('/profile', protect, updateProfile);
router.get('/', getArtisans);

module.exports = router;