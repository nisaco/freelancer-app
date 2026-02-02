const express = require('express');
const router = express.Router();
const axios = require('axios');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// --- 1. INITIALIZE PAYMENT ---
// This creates the payment link for the client
router.post('/initialize', protect, async (req, res) => {
    try {
        const { artisanId, amount, date, description, category } = req.body;

        // Create the Job record in 'pending_payment' status
        const job = await Job.create({
            client: req.user._id,
            artisan: artisanId,
            amount,
            date,
            description,
            category,
            status: 'pending_payment'
        });

        const paystackData = {
            email: req.user.email,
            amount: amount * 100, // Paystack works in pesewas
            callback_url: `${process.env.FRONTEND_URL}/payment-callback`,
            metadata: {
                jobId: job._id,
                artisanId: artisanId
            }
        };

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            paystackData,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );

        // Save reference to the job for verification later
        job.paymentReference = response.data.data.reference;
        await job.save();

        res.json(response.data.data);
    } catch (error) {
        console.error("Payment Init Error:", error.message);
        res.status(500).json({ message: "Could not initialize payment" });
    }
});

// --- 2. VERIFY PAYMENT (The Callback) ---
// This is the one that was crashing. It is now wrapped in an ASYNC function.
router.get('/verify', async (req, res) => {
    const { reference } = req.query;

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );

        if (response.data.data.status === 'success') {
            // Find the job using the reference
            const job = await Job.findOne({ paymentReference: reference });

            if (job && job.status === 'pending_payment') {
                const totalPaid = response.data.data.amount / 100; 
                const artisanShare = totalPaid * 0.90; // 90% for the Artisan

                // --- ESCROW AUTOMATION ---
                // Add the money to the artisan's PENDING balance
                await User.findByIdAndUpdate(job.artisan, {
                    $inc: { pendingBalance: artisanShare }
                });

                // Update job to 'paid' so artisan can see the 'Mark Finished' button
                job.status = 'paid';
                await job.save();
            }

            // Redirect back to your frontend success page
            return res.redirect(`${process.env.FRONTEND_URL}/payment-success?reference=${reference}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
        }
    } catch (error) {
        console.error("Verification Error:", error.message);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
});

module.exports = router;