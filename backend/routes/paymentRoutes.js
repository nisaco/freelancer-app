const express = require('express');
const router = express.Router();
// Make sure this path to your controller is correct!
const { initializePayment, verifyPayment } = require('../controllers/paymentController');

// Route to start payment
router.post('/pay', initializePayment);

// Route for Paystack to call back (This was likely the one crashing at line 10)
router.get('/callback', verifyPayment); 

module.exports = router;