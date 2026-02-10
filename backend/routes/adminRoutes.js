const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { verifyArtisan } = require('../controllers/authController');

// --- SECURITY MIDDLEWARE: ADMIN ONLY ---
// This ensures only users with the 'admin' role can access these routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// 1. Get all artisans who uploaded cards but aren't verified yet
// Applied both 'protect' (logged in) and 'adminOnly' (correct role)
router.get('/pending-artisans', protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } 
    }).select('-password'); // Security: Don't send password hashes to the frontend

    res.json(pending);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ message: "Error fetching pending artisans" });
  }
});

// 2. The Verification Action
router.put('/verify/:id', protect, adminOnly, verifyArtisan);

module.exports = router;