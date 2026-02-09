const express = require('express');
const router = express.Router();
const { requestPayout, getMyTransactions, completePayout } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Artisan Routes
router.post('/request', protect, requestPayout);
router.get('/my-transactions', protect, getMyTransactions);

// Admin Route (You'll use this later)
router.put('/complete/:id', protect, completePayout);
// Add this line to your existing transaction routes
router.get('/admin/all', protect, getAllPayouts);


module.exports = router;