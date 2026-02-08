const express = require('express');
const router = express.Router();
// 1. Import getProfile and 2. Ensure loginUser/registerUser are there
const { registerUser, loginUser, getProfile } = require('../controllers/authController');

// 3. Import the protect middleware from your middleware file
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser); 
router.get('/profile', protect, getProfile); // Now 'protect' and 'getProfile' are recognized

module.exports = router;