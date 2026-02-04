const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { 
  getAvailableArtisans, 
  createJob 
} = require('../controllers/jobController');

// --- 1. MARKETPLACE & CREATION ---
router.get('/available', getAvailableArtisans);
router.post('/', protect, createJob);

// --- 2. THE "MY-JOBS" ROUTE (Fixes your 404 Error) ---
// This handles the call from ArtisanDashboard.jsx and Client Dashboard
router.get('/my-jobs', protect, async (req, res) => {
  try {
    // Find jobs where the user is either the client OR the artisan
    const jobs = await Job.find({ 
      $or: [{ client: req.user._id }, { artisan: req.user._id }] 
    })
    .populate('client', 'username email') 
    .populate('artisan', 'username category price phone profilePic isVerified')
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("Error in /my-jobs:", err);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// --- 3. LEGACY ROUTES (Keep these so old links don't break) ---
router.get('/artisan', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ artisan: req.user._id }).populate('client', 'username email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id }).populate('artisan', 'username category price phone profilePic').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// --- 4. THE AUTOMATION LOGIC: FINISH JOB & PAYOUT ---
router.put('/:id/finish', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('artisan');
    
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure only the assigned artisan can finish the job
    if (job.artisan._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Safety check: Money must be in 'paid' status before moving to wallet
    if (job.status !== 'paid') {
      return res.status(400).json({ message: "Job must be paid first" });
    }

    const artisan = await User.findById(job.artisan._id);
    const amountToMove = job.amount * 0.90; // 10% platform fee

    if (artisan.isVerified) {
      // Logic for verified artisans
      artisan.walletBalance = (artisan.walletBalance || 0) + amountToMove;
      job.status = 'completed';
      
      await artisan.save();
      await job.save();
      res.json({ message: "Job completed! Funds released to wallet.", job });
    } else {
      // Logic for unverified artisans
      job.status = 'completed';
      await job.save();
      res.json({ message: "Job done, but funds held until account verification.", job });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Automation Error during payout" });
  }
});

// --- 5. UNIVERSAL UPDATE: CHANGE STATUS ---
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;