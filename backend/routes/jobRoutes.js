const express = require('express');
const router = express.Router();
// Ensure the names here match the "exports.name" in jobController.js exactly
const { 
    getAvailableArtisans, 
    createJob, 
    getMyJobs, 
    updateJobStatus 
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard route
router.get('/available', protect, getAvailableArtisans);

// Booking and management routes
router.post('/', protect, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.put('/:id', protect, updateJobStatus);

module.exports = router;