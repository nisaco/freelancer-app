const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Optional: Require login to pay

// Route: POST /api/payment/pay
router.post('/pay', initializePayment);

// Route: GET /api/payment/verify
router.get('/verify', verifyPayment);

module.exports = router;