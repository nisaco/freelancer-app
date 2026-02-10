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
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalArtisans = await User.countDocuments({ role: 'artisan' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const pendingVerifications = await User.countDocuments({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } 
    });

    // We send back a nested structure because the frontend is clearly 
    // looking for properties inside an object (like revenue or transactions)
    res.json({
      totalArtisans,
      totalClients,
      pendingVerifications,
      // This part stops the "undefined (reading 'totalVolume')" crash
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
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to load admin stats" });
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