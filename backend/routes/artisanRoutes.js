const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  getArtisans, 
  getCurrentProfile 
} = require('../controllers/artisanController');
const { protect } = require('../middleware/authMiddleware');

// Fixed imports to prevent ReferenceError/TypeError
router.get('/me', protect, getCurrentProfile);
router.post('/profile', protect, updateProfile);
router.get('/', getArtisans);

module.exports = router;