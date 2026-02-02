const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Added security

// Inside your Paystack Verify Route
const totalAmount = res.data.data.amount / 100;
const artisanShare = totalAmount * 0.90; // 90% for them

await User.findByIdAndUpdate(job.artisan, {
  $inc: { pendingBalance: artisanShare }
});

// Added detailed logging to help you debug during deployment
console.log("--- Payment Routes Loading ---");
if (!paymentController.initializePayment) {
    console.error("CRITICAL: initializePayment is UNDEFINED in paymentController.js");
}
if (!paymentController.verifyPayment) {
    console.error("CRITICAL: verifyPayment is UNDEFINED in paymentController.js");
}

// 1. MATCH THE FRONTEND: Changed '/pay' to '/initialize' 
// 2. ADD PROTECT: So the backend knows WHO is paying
router.post('/initialize', protect, paymentController.initializePayment);

// 3. Callback for Paystack to redirect back to
router.get('/callback', paymentController.verifyPayment); 

module.exports = router;