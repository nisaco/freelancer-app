const express = require('express');
const router = express.Router();

// 1. BE CAREFUL HERE: Ensure the path to your controller is 100% correct
const paymentController = require('../controllers/paymentController');

// 2. Add a console log to see if the functions actually exist during startup
console.log("Loading Payment Routes...");
console.log("initializePayment function exists:", typeof paymentController.initializePayment === 'function');
console.log("verifyPayment function exists:", typeof paymentController.verifyPayment === 'function');

// 3. Define the routes
router.post('/pay', paymentController.initializePayment);

// This is line 10 - the one causing the crash. 
// We must ensure verifyPayment is a real function.
router.get('/callback', paymentController.verifyPayment); 

module.exports = router;