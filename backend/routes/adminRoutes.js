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

// 1. Admin Stats (Structured to match the Frontend 'data' state)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalArtisans = await User.countDocuments({ role: 'artisan' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalUsers = await User.countDocuments();
    
    // Fetch the actual pending artisans list for the queue
    const pendingArtisansList = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCard: { $exists: true, $ne: '' } 
    }).select('-password');

    // Send the exact object structure the frontend "data" state uses
    res.json({
      stats: {
        totalArtisans,
        totalClients,
        totalUsers,
        totalVolume: 0, // Placeholder for Network Volume
        revenue: {
          totalVolume: 0, // Shield for deeply nested frontend calls
          monthlyGrowth: 0
        }
      },
      pendingArtisans: pendingArtisansList,
      recentTransactions: [] // Placeholder to prevent map() errors
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// 2. Get all artisans pending verification (Direct endpoint if needed)
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