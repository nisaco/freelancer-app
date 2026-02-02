const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/authMiddleware');

// --- 1. FOR ARTISANS: GET JOBS ASSIGNED TO ME ---
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

// ARTISAN: Mark a job as finished
router.put('/:id/finish', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure only the assigned artisan can finish the job
    if (job.artisan.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    job.status = 'completed';
    await job.save();

    res.json({ message: "Job marked as completed!", job });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// --- 2. FOR CLIENTS: GET JOBS I HAVE BOOKED ---
// GET jobs for the logged-in client
router.get('/client', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate('artisan', 'username category price phone') // <--- ADD 'phone' HERE
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your bookings" });
  }
});
// --- 3. OPTIONAL: UPDATE JOB STATUS (Mark as Done) ---
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