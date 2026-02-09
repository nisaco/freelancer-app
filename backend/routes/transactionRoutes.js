const express = require('express');
const router = express.Router();
const { 
  requestPayout, 
  getMyTransactions, 
  getAllPayouts, 
  completePayout 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Artisan Routes
router.post('/request', protect, requestPayout);
router.get('/my-transactions', protect, getMyTransactions); // This fixes your 404

// Admin Routes
router.get('/admin/all', protect, getAllPayouts);
router.put('/complete/:id', protect, completePayout);

module.exports = router;