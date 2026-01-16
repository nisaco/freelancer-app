const express = require('express');
const router = express.Router();

// --- THE FIX IS HERE ---
// We must import ALL THREE functions inside the curly brackets
const { 
  updateProfile, 
  getArtisans,      // <--- This was missing!
  getCurrentProfile 
} = require('../controllers/artisanController');

const { protect } = require('../middleware/authMiddleware');

// Route to SAVE profile (Protected)
router.post('/profile', protect, updateProfile);

// Route to GET all artisans (Public)
router.get('/', getArtisans); 

// Route to GET my own profile (Protected)
router.get('/me', protect, getCurrentProfile);

module.exports = router;