const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, updateJobStatus } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Route to Create a Job (Client)
router.post('/', protect, createJob);
// The route Dashboard.jsx is calling
router.get('/available', protect, getAvailableArtisans);

// Route to Get My Jobs (Client & Artisan)
router.get('/', protect, getMyJobs);

// --- THIS WAS LIKELY MISSING ---
// Route to Update Job Status (Artisan)
router.put('/:id', protect, updateJobStatus);
// -------------------------------

module.exports = router;