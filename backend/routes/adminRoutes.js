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
      ghanaCard: { $exists: true, $ne: '' } 
    }).select('-password');

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
      ghanaCard: { $exists: true, $ne: '' } 
    }).select('-password');
    res.json(pending);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ message: "Error fetching pending artisans" });
  }
});

// 5. The Verification Action
router.put('/verify/:id', protect, adminOnly, verifyArtisan);

module.exports = router;