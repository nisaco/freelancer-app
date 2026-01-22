const User = require('../models/User');

// @desc    Get platform metrics and pending artisans
// @route   GET /api/admin/dashboard-stats
exports.getAdminStats = async (req, res) => {
  try {
    // 1. Run counts in parallel for speed
    const [totalArtisans, totalClients, pendingArtisans] = await Promise.all([
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ role: 'client' }),
      User.find({ isPending: true, isVerified: false })
        .select('username email category location ghanaCardNumber ghanaCardImage')
    ]);

    res.json({
      stats: {
        totalArtisans,
        totalClients,
        totalUsers: totalArtisans + totalClients
      },
      pendingArtisans
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};