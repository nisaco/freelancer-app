const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { getAvailableArtisans, createJob } = require('../controllers/jobController');

// --- 1. MARKETPLACE ---
router.get('/available', getAvailableArtisans);
router.post('/', protect, createJob);

// --- 2. CLIENT BOOKINGS (Fixes the 404 Found Error) ---
router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate('artisan', 'username category price phone profilePic isVerified')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// --- 3. ARTISAN JOBS (Fixes the Dashboard Sync Failed) ---
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

// --- 4. THE UNIVERSAL FETCH (For the new dashboards) ---
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

// --- 5. ARTISAN SETTINGS UPDATE (Fixes "Update Failed" on Phone/Bio) ---
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

// --- 6. ARTISAN: MARK FINISHED ---
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

// --- 7. CLIENT: CONFIRM & RELEASE FUNDS (The 80/20 Escrow Logic) ---
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const { rating } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const artisan = await User.findById(job.artisan);
    const artisanShare = job.amount * 0.80; // Your 80% share logic

    if (artisan.isVerified) {
      artisan.walletBalance = (artisan.walletBalance || 0) + artisanShare;
      artisan.pendingBalance = Math.max(0, (artisan.pendingBalance || 0) - artisanShare);
      
      if (rating) {
        const count = artisan.reviewCount || 0;
        artisan.rating = ((artisan.rating * count) + rating) / (count + 1);
        artisan.reviewCount = count + 1;
      }
      
      job.status = 'completed';
      await artisan.save();
      await job.save();
      res.json({ message: "Funds released to artisan wallet!", job });
    } else {
      job.status = 'completed';
      await job.save();
      res.json({ message: "Job completed. Funds held until verification.", job });
    }
  } catch (err) {
    res.status(500).json({ message: "Release failed" });
  }
});

// --- 8. CATCH-ALL STATUS UPDATE ---
router.put('/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;