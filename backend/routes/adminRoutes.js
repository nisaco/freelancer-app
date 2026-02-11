const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
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
 
    // 2. Calculate Network Volume (Sum of all successful transactions)
    const volumeData = await Transaction.aggregate([
      { $match: { status: 'completed' } }, 
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = volumeData.length > 0 ? volumeData[0].total : 0;

    // 3. Fetch Recent Transactions for the Live Feed
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch the actual pending artisans list for the queue
    const pendingArtisansList = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCardImage: { $exists: true, $ne: '' } 
    }).select('-password').sort({ subscriptionTier: -1, createdAt: 1 });

    // --- FIX: SEND THE ACTUAL VARIABLES INSTEAD OF 0 AND [] ---
    res.json({
      stats: {
        totalArtisans,
        totalClients,
        totalUsers,
        totalVolume: totalVolume, // Was 0
        revenue: {
          totalVolume: totalVolume, // Was 0
          monthlyGrowth: 0
        }
      },
      pendingArtisans: pendingArtisansList,
      recentTransactions: recentTransactions // Was []
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// 4. Get all artisans pending verification
router.get('/pending-artisans', protect, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'artisan', 
      isVerified: false,
      ghanaCardImage: { $exists: true, $ne: '' } 
    }).select('-password').sort({ subscriptionTier: -1, createdAt: 1 });
    res.json(pending);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ message: "Error fetching pending artisans" });
  }
});

// 5. Get all artisans for verification management
router.get('/artisans', protect, adminOnly, async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(artisans);
  } catch (err) {
    console.error("Admin Artisan Fetch Error:", err);
    res.status(500).json({ message: "Error fetching artisans" });
  }
});

// 5. The Verification Action
router.put('/verify/:id', protect, adminOnly, verifyArtisan);

module.exports = router;
