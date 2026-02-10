const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { verifyArtisan } = require('../controllers/authController');

// --- SECURITY MIDDLEWARE: ADMIN ONLY ---
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// 1. Admin Stats (Deeply Structured to prevent frontend crashes)
router.get('/stats', protect, async (req, res) => {
  try {
    // 1. Get actual counts from DB
    const totalArtisans = await User.countDocuments({ role: 'artisan' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const pendingVerifications = await User.countDocuments({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } 
    });

    // 2. Send the FULL structure the frontend expects
    res.json({
      totalArtisans,
      totalClients,
      pendingVerifications,
      // We nest these so stats.revenue.totalVolume isn't undefined
      revenue: {
        totalVolume: 0,
        monthlyGrowth: 0
      },
      transactions: {
        totalVolume: 0,
        recent: []
      }
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// 2. Get all artisans pending verification
router.get('/pending-artisans', protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } 
    }).select('-password');

    res.json(pending);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ message: "Error fetching pending artisans" });
  }
});

// 3. The Verification Action
router.put('/verify/:id', protect, adminOnly, verifyArtisan);

module.exports = router;