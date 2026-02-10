const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { verifyArtisan } = require('../controllers/authController');

// 1. Get all artisans who uploaded cards but aren't verified yet
router.get('/pending-artisans', protect, async (req, res) => {
  try {
    // Only allow Admins (optional check: if(req.user.role !== 'admin')...)
    const pending = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } // Only those who actually uploaded a card
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending artisans" });
  }
});

// 2. The Verification Action
router.put('/verify/:id', protect, verifyArtisan);

module.exports = router;