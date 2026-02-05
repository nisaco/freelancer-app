const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { 
  getAvailableArtisans, 
  createJob 
} = require('../controllers/jobController');

// --- 1. MARKETPLACE & BOOKING ---
router.get('/available', getAvailableArtisans);
router.post('/', protect, createJob);

// --- 2. UNIVERSAL DASHBOARD FETCH ---
// Fixes "Dashboard Sync Failed" for both Client and Artisan
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
    res.status(500).json({ message: "Error fetching dashboard" });
  }
});

// --- 3. THE "ALL-IN-ONE" UPDATE ROUTE ---
// This handles: Profile Updates, "Mark Finished", and "Client Confirm"
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, phone, bio, price, location, rating } = req.body;

    // CASE A: User is updating their own Profile (from Settings)
    if (req.params.id === req.user._id.toString()) {
      const user = await User.findById(req.user._id);
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (price) user.price = price;
      if (location) user.location = location;
      await user.save();
      return res.json({ message: "Profile Updated Successfully", user });
    }

    // CASE B: Status Update (Job Management)
    const job = await Job.findById(req.params.id).populate('artisan');
    if (!job) return res.status(404).json({ message: "Job not found" });

    // SUB-CASE: Client confirms and releases money
    if (status === 'completed' && job.status === 'awaiting_confirmation') {
       const artisan = await User.findById(job.artisan._id);
       const artisanShare = job.amount * 0.90; // 90% to artisan

       artisan.walletBalance = (artisan.walletBalance || 0) + artisanShare;
       // If artisan has pendingBalance from the initial payment, reduce it
       if (artisan.pendingBalance) {
         artisan.pendingBalance = Math.max(0, artisan.pendingBalance - artisanShare);
       }

       // Update Rating
       if (rating) {
         const count = artisan.reviewCount || 0;
         artisan.rating = ((artisan.rating * count) + rating) / (count + 1);
         artisan.reviewCount = count + 1;
       }

       await artisan.save();
       job.status = 'completed';
    } else {
       // Standard status change (e.g., 'paid' -> 'awaiting_confirmation')
       job.status = status || job.status;
    }

    await job.save();
    res.json({ message: "Status updated", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// Alias for the 'finish' button if your frontend still uses it
router.put('/:id/finish', protect, async (req, res) => {
    // Redirects to the main update logic above
    req.body.status = 'awaiting_confirmation';
    router.handle(req, res); 
});

module.exports = router;