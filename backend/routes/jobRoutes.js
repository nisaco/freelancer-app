const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAvailableArtisans,
  getFeaturedArtisans,
  getArtisanProfile,
  getArtisanAnalytics,
  getArtisanAvailability,
  updateMyAvailability,
  createJob,
  getArtisanReviews,
  updateJobStatus,
  downloadInvoice,
  getArtisanJobs,
  getMyJobs,
  // --- NEW BIDDING IMPORTS ---
  postOpenJob,
  getOpenJobs,
  submitBid,
  getJobBids,
  acceptBid
} = require('../controllers/jobController');

const ARTISAN_EARNINGS_RATIO = 0.8;

// --- 1. OPEN MARKETPLACE (Bidding) ROUTES ---
router.post('/open', protect, postOpenJob); // Client posts open job
router.get('/open', protect, getOpenJobs); // Artisan views open jobs
router.post('/:id/bid', protect, submitBid); // Artisan bids
router.get('/:id/bids', protect, getJobBids); // Client views bids
router.post('/:id/accept-bid/:bidId', protect, acceptBid); // Client accepts bid

// --- 2. EXISTING DIRECT ROUTES ---

// Marketplace + artisan profile
router.get('/available', getAvailableArtisans);
router.get('/featured', getFeaturedArtisans);
router.get('/artisan/analytics/me', protect, authorize('artisan'), getArtisanAnalytics);
router.put('/artisan/availability/me', protect, authorize('artisan'), updateMyAvailability);
router.get('/artisan/:id/availability', getArtisanAvailability);
router.get('/artisan/:id', getArtisanProfile);
router.get('/artisan/my-jobs', protect, authorize('artisan'), getArtisanJobs);

// Booking creation
router.post('/', protect, createJob);

// Client booking history
router.get('/client', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const jobs = await Job.find({ client: userId })
      .populate('artisan', 'username category price phone profilePic isVerified subscriptionTier subscriptionStatus subscriptionExpiresAt')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Artisan job history
router.get('/artisan', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const jobs = await Job.find({ artisan: userId })
      .populate('client', 'username email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching artisan jobs" });
  }
});

// Universal job history
router.get('/my-jobs', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const jobs = await Job.find({ $or: [{ client: userId }, { artisan: userId }] })
      .populate('client', 'username email')
      .populate('artisan', 'username category price phone profilePic isVerified')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// Artisan profile setup
router.put('/profile-setup', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { phone, bio, price, location } = req.body;
    const user = await User.findById(userId);

    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (price) user.price = price;
    if (location) user.location = location;

    await user.save();
    res.json({ message: "Profile Synchronized", user });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// Artisan marks work done
router.put('/:id/finish', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.artisan.toString() !== userId.toString()) return res.status(401).json({ message: "Unauthorized" });

    job.status = 'awaiting_confirmation';
    await job.save();
    res.json({ message: "Awaiting client confirmation", job });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Client confirms completion and releases escrow
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { rating, reviewComment } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.client.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Only the client can release escrow funds" });
    }

    const artisan = await User.findById(job.artisan);
    const artisanShare = Number(job.amount || 0) * ARTISAN_EARNINGS_RATIO;

    if (artisan && artisan.isVerified) {
      artisan.walletBalance = (artisan.walletBalance || 0) + artisanShare;
      artisan.pendingBalance = Math.max(0, (artisan.pendingBalance || 0) - artisanShare);

      if (rating) {
        const count = artisan.reviewCount || 0;
        artisan.rating = ((Number(artisan.rating || 5) * count) + Number(rating)) / (count + 1);
        artisan.reviewCount = count + 1;
      }

      await artisan.save();
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.escrowReleasedAt = new Date();
    if (rating) job.rating = Number(rating);
    if (reviewComment) job.reviewComment = reviewComment;
    await job.save();

    res.json({
      message: "Job completed. Escrow released after client confirmation.",
      job
    });
  } catch (err) {
    res.status(500).json({ message: "Release failed" });
  }
});

// PDF invoice
router.get('/:id/invoice', protect, downloadInvoice);

// Status update
router.put('/:id', protect, updateJobStatus);

// Reviews
router.get('/reviews/:id', getArtisanReviews);

module.exports = router;