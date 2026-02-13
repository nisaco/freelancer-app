const User = require('../models/User');
const Job = require('../models/Job'); // Import the Job model for intelligence
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

// @desc    Get platform metrics, pending artisans, and financial intelligence
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // Run counts and financial aggregation in parallel for maximum performance
    const [totalArtisans, totalClients, pendingArtisans, volumeData, recentJobs] = await Promise.all([
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ role: 'client' }),
      // KEEPING YOUR LOGIC: isPending and isVerified checks
      User.find({ role: 'artisan', isVerified: false, ghanaCardImage: { $exists: true, $ne: '' } })
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

    const totalVolume = volumeData.length > 0 ? volumeData[0].total : 0;

    res.json({
      stats: {
        totalArtisans,
        totalClients,
        totalUsers: totalArtisans + totalClients,
        totalVolume // Now included in the response
      },
      pendingArtisans,
      recentTransactions: recentJobs // Now included for the Live Feed
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
    } else if (status === 'reject' || status === 'unverify') {
      user.isVerified = false;
      user.isPending = false; 
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await user.save();
    res.json({ message: `Artisan ${status}d successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get comprehensive list of all users with activity stats
// @route   GET /api/admin/users
exports.getUsersList = async (req, res) => {
  try {
    const users = await User.aggregate([
      // 1. Join with Jobs to see Client activity
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "client",
          as: "clientJobs"
        }
      },
      // 2. Join with Jobs to see Artisan activity
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "artisan",
          as: "artisanJobs"
        }
      },
      // 3. Project the fields we need
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          isVerified: 1,
          createdAt: 1,
          profilePic: 1,
          phone: 1,
          location: 1,
          // Count total jobs (Client bookings + Artisan jobs)
          transactionCount: { $add: [{ $size: "$clientJobs" }, { $size: "$artisanJobs" }] },
          // Determine last active based on latest job or profile update
          lastActive: { $max: ["$updatedAt", { $max: "$clientJobs.createdAt" }, { $max: "$artisanJobs.createdAt" }] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(users);
  } catch (error) {
    console.error("User List Error:", error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};