const express = require('express');
const router = express.Router();
const { 
  getAvailableArtisans, 
  createJob, 
  getMyJobs, 
  updateJobStatus 
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Ensure this matches the function name in jobController.js
router.get('/available', protect, getAvailableArtisans);

router.post('/', protect, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.put('/:id', protect, updateJobStatus);

module.exports = router;