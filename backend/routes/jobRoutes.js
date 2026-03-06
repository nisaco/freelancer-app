const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const jobController = require('../controllers/jobController');

const ARTISAN_EARNINGS_RATIO = 0.8;

// --- FAIL-SAFE WRAPPERS ---
// These wrappers prevent the server from crashing at boot time (TypeError) 
// if a controller function is missing or delayed during deployment.
const safe = (handlerName) => {
  return (req, res, next) => {
    const handler = jobController[handlerName];
    if (typeof handler !== 'function') {
      console.error(`CRITICAL: ${handlerName} is missing from jobController.js!`);
      return res.status(500).json({ message: `Server error: ${handlerName} is currently unavailable.` });
    }
    return handler(req, res, next);
  };
};

const safeAuthorize = (role) => {
  return (req, res, next) => {
    if (typeof authorize === 'function') {
      const middleware = authorize(role);
      if (typeof middleware === 'function') return middleware(req, res, next);
    }
    // Fallback role check
    if (req.user && req.user.role === role) return next();
    return res.status(403).json({ message: 'Access denied. Invalid role.' });
  };
};

// --- 1. OPEN MARKETPLACE (Bidding) ROUTES ---
router.post('/open', protect, safe('postOpenJob')); // Client posts open job
router.get('/open', protect, safe('getOpenJobs')); // Artisan views open jobs
router.post('/:id/bid', protect, safe('submitBid')); // Artisan bids
router.get('/:id/bids', protect, safe('getJobBids')); // Client views bids
router.post('/:id/accept-bid/:bidId', protect, safe('acceptBid')); // Client accepts bid

// --- 2. EXISTING DIRECT ROUTES ---

// Marketplace 
router.get('/available', safe('getAvailableArtisans'));
router.get('/featured', safe('getFeaturedArtisans'));

// Specific Artisan Routes (Must be declared BEFORE /:id routes)
router.get('/artisan/analytics/me', protect, safeAuthorize('artisan'), safe('getArtisanAnalytics'));
router.put('/artisan/availability/me', protect, safeAuthorize('artisan'), safe('updateMyAvailability'));
router.get('/artisan/my-jobs', protect, safe('getMyJobs'));

// Dynamic Artisan ID Routes
router.get('/artisan/:id/availability', safe('getArtisanAvailability'));
router.get('/artisan/:id', safe('getArtisanProfile'));

// Booking creation
router.post('/', protect, safe('createJob'));

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
router.get('/my-jobs', protect, safe('getMyJobs'));

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
router.get('/:id/invoice', protect, safe('downloadInvoice'));

// Status update
router.put('/:id', protect, safe('updateJobStatus'));

// Reviews
router.get('/reviews/:id', safe('getArtisanReviews'));

module.exports = router;