const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); // Added this so User is defined
const { protect } = require('../middleware/authMiddleware');
const { 
  getAvailableArtisans, 
  createJob 
} = require('../controllers/jobController');

// --- 1. MARKETPLACE & CREATION ---
router.get('/available', getAvailableArtisans);
router.post('/', protect, createJob);

// --- 2. FOR ARTISANS: GET JOBS ASSIGNED TO ME ---
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

// --- 3. FOR CLIENTS: GET JOBS I HAVE BOOKED ---
router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate('artisan', 'username category price phone profilePic') 
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your bookings" });
  }
});

// --- 4. THE AUTOMATION LOGIC: FINISH JOB & PAYOUT ---
// We merged your two finish routes into this single one to prevent errors
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
      // Move from Pending/Escrow to Withdrawable Wallet
      // Note: Make sure pendingBalance exists in your User model
      if (artisan.pendingBalance >= amountToMove) {
        artisan.pendingBalance -= amountToMove;
      }
      
      artisan.walletBalance = (artisan.walletBalance || 0) + amountToMove;
      job.status = 'completed';
      
      await artisan.save();
      await job.save();
      res.json({ message: "Job completed! Funds released to wallet.", job });
    } else {
      // If not verified, job finishes but money stays held
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