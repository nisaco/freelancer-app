const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Mark job as finished and release Escrow funds
// @route   PUT /api/jobs/:id/finish
router.put('/:id/finish', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.artisan.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (job.status !== 'paid') {
      return res.status(400).json({ message: "Only paid jobs can be finished" });
    }

    const artisan = await User.findById(req.user._id);
    const artisanShare = job.amount * 0.90; // 90% share

    // --- AUTOMATED FUND RELEASE LOGIC ---
    if (artisan.isVerified) {
      // Move from Pending to Withdrawable
      artisan.pendingBalance = Math.max(0, artisan.pendingBalance - artisanShare);
      artisan.walletBalance += artisanShare;
      job.status = 'completed';
      
      await artisan.save();
      await job.save();
      res.json({ message: "Job completed. GHS " + artisanShare + " released to your wallet!", job });
    } else {
      // Job is finished, but money stays in Pending until ID is verified
      job.status = 'completed';
      await job.save();
      res.json({ message: "Job completed! Funds held in Escrow until your ID is verified.", job });
    }

  } catch (err) {
    res.status(500).json({ message: "Escrow release failed", error: err.message });
  }
});

// GET Artisan Jobs
router.get('/artisan', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ artisan: req.user._id }).populate('client', 'username').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// GET Client Bookings
router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id }).populate('artisan', 'username category phone').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

module.exports = router;