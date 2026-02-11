const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAvailableArtisans,
  getArtisanProfile,
  getArtisanAnalytics,
  createJob,
  getArtisanReviews,
  updateJobStatus,
  downloadInvoice
} = require('../controllers/jobController');

const ARTISAN_EARNINGS_RATIO = 0.8;

// Marketplace + artisan profile
router.get('/available', getAvailableArtisans);
router.get('/artisan/analytics/me', protect, authorize('artisan'), getArtisanAnalytics);
router.get('/artisan/:id', getArtisanProfile);

// Booking creation
router.post('/', protect, createJob);

// Client booking history
router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
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
    const jobs = await Job.find({ artisan: req.user._id })
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
    const jobs = await Job.find({ $or: [{ client: req.user._id }, { artisan: req.user._id }] })
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
    const { phone, bio, price, location } = req.body;
    const user = await User.findById(req.user._id);

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
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.artisan.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Unauthorized" });

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
    const { rating, reviewComment } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.client.toString() !== req.user._id.toString()) {
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
