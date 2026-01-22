const axios = require('axios');
const Job = require('../models/Job'); // Ensure you have this model!

// --- 1. INITIALIZE PAYMENT ---
exports.initializePayment = async (req, res) => {
    // 1. Get ALL the data from the frontend
    const { artisanId, amount, date, description, category } = req.body;
    const email = req.user.email; // Taken from 'protect' middleware

    if (!process.env.PAYSTACK_SECRET_KEY) {
        console.error("CRITICAL ERROR: PAYSTACK_SECRET_KEY is missing!");
        return res.status(500).json({ error: 'Server Configuration Error' });
    }

    try {
        // 2. CREATE A PENDING JOB IN YOUR DB FIRST
        // This ensures the date/description are saved before redirecting to Paystack
        const newJob = await Job.create({
            client: req.user._id,
            artisan: artisanId,
            amount: amount,
            date: date,
            description: description,
            serviceType: category || 'General Service', // Fixes the validation error
            status: 'pending_payment'
        });

        // 3. PREPARE PAYSTACK PARAMS
        const params = {
            email: email,
            amount: Math.round(amount * 100), // GHS to Pesewas
            currency: 'GHS',
            callback_url: "https://hireme-bk0l.onrender.com/payment/callback",
            // Use metadata to keep track of the Job ID during payment
            metadata: {
                jobId: newJob._id,
                custom_fields: [
                    { display_name: "Service Date", variable_name: "date", value: date },
                    { display_name: "Description", variable_name: "desc", value: description }
                ]
            }
        };

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            params,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 4. Send the full data (including authorization_url) back to frontend
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error("PAYSTACK INITIALIZE ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
};

// --- 2. VERIFY PAYMENT ---
exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}` }
            }
        );

        const data = response.data.data;

        // 5. UPDATE JOB STATUS ON SUCCESS
        if (data.status === 'success') {
            const jobId = data.metadata.jobId;
            await Job.findByIdAndUpdate(jobId, { status: 'paid' });
        }

        res.status(200).json(response.data);
    } catch (error) {
        console.error("PAYSTACK VERIFY ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};