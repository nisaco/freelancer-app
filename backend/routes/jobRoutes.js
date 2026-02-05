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

// --- 2. THE UNIVERSAL DASHBOARD FETCH (Fixes "Sync Failed") ---
router.get('/my-jobs', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ 
      $or: [{ client: req.user._id }, { artisan: req.user._id }] 
    })
    .populate('client', 'username email') 
    .populate('artisan', 'username category price phone profilePic isVerified')
    .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

// --- 3. LEGACY ROLE FETCHES ---
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
    const jobs = await Job.find({ client: req.user._id }).populate('artisan', 'username category phone').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// --- 4. THE ESCROW & WALLET AUTOMATION (The "Finish" Route) ---
router.put('/:id/finish', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('artisan');
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Authorization: Only the assigned artisan can finish
    if (job.artisan._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Safety check: Job must be 'paid' (money in escrow) before moving to wallet
    if (job.status !== 'paid') {
      return res.status(400).json({ message: "Job must be paid first" });
    }

    const artisan = await User.findById(job.artisan._id);
    const amountToMove = job.amount * 0.90; // 10% platform fee

    if (artisan.isVerified) {
      // Release funds to withdrawable wallet
      artisan.walletBalance = (artisan.walletBalance || 0) + amountToMove;
      job.status = 'completed';
      await artisan.save();
    } else {
      // Hold funds but mark job as done
      job.status = 'completed';
    }
    
    await job.save();
    res.json({ message: "Job completed and funds processed!", job });
  } catch (err) {
    res.status(500).json({ message: "Automation Error", error: err.message });
  }
});

// --- 5. THE GENERIC UPDATE (Fixes the 404 on "Mark Finished") ---
// This route is called by ArtisanDashboard.jsx when status changes to 'awaiting_confirmation'

router.put('/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;
        
        // This handles the status flow (paid -> awaiting_confirmation -> completed)
        const job = await Job.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!job) return res.status(404).json({ message: "Job not found" });
        
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;