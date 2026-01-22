const User = require('../models/User');

// @desc    Get platform metrics and pending artisans
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // Run counts in parallel for performance
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
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve or Reject an Artisan
// @route   PUT /api/admin/verify/:id
exports.verifyArtisan = async (req, res) => {
  const { status } = req.body; // 'approve' or 'reject'
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (status === 'approve') {
      user.isVerified = true;
      user.isPending = false;
    } else {
      user.isPending = false; 
    }

    await user.save();
    res.json({ message: `Artisan ${status}d successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};