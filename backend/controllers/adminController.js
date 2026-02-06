const User = require('../models/User');
const Job = require('../models/Job'); // Import the Job model for intelligence

// @desc    Get platform metrics, pending artisans, and financial intelligence
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // Run counts and financial aggregation in parallel for maximum performance
    const [totalArtisans, totalClients, pendingArtisans, volumeData, recentJobs] = await Promise.all([
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ role: 'client' }),
      // KEEPING YOUR LOGIC: isPending and isVerified checks
      User.find({ isPending: true, isVerified: false })
        .select('username email category location ghanaCardNumber ghanaCardImage'),
      
      // NEW: Calculate Total Network Volume
      Job.aggregate([
        { $match: { status: { $in: ['paid', 'completed', 'awaiting_confirmation'] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      // NEW: Fetch Recent Transactions for the Live Feed
      Job.find({ status: { $in: ['paid', 'completed'] } })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('client', 'username')
        .populate('artisan', 'username')
    ]);

    // Extract total volume safely
    const totalVolume = volumeData.length > 0 ? volumeData[0].total : 0;

    // Format recent transactions for the sophisticated frontend feed
    const recentTransactions = recentJobs.map(job => ({
      clientName: job.client?.username || "Guest",
      artisanName: job.artisan?.username || "Pro",
      amount: job.amount,
      createdAt: job.updatedAt
    }));

    res.json({
      stats: {
        totalArtisans,
        totalClients,
        totalUsers: totalArtisans + totalClients,
        totalVolume // Now included in the response
      },
      pendingArtisans,
      recentTransactions // Now included for the Live Feed
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

    // KEEPING YOUR LOGIC EXACTLY AS IT WAS
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
  // Notify the Artisan
  await Notification.create({
    recipient: user._id,
    message: `Congratulations! Your professional identity has been verified. You are now live on the marketplace.`,
    type: 'system'
  });
}