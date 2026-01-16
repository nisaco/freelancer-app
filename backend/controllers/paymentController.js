const axios = require('axios');

// --- 1. INITIALIZE PAYMENT ---
exports.initializePayment = async (req, res) => {
    const { email, amount } = req.body;

    // Check if the secret key is loaded from Render env
    if (!process.env.PAYSTACK_SECRET_KEY) {
        console.error("CRITICAL ERROR: PAYSTACK_SECRET_KEY is missing in environment variables!");
        return res.status(500).json({ error: 'Internal Server Configuration Error' });
    }

    const params = {
        email: email,
        amount: Math.round(amount * 100), // Convert GHS to Pesewas
        currency: 'GHS',
        callback_url: "https://hireme-bk0l.onrender.com/payment/callback"
    };

    try {
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

        // Success: Send the Paystack authorization URL to the frontend
        res.status(200).json(response.data);
    } catch (error) {
        // This log is for you to see in Render Dashboard -> Logs
        console.error("PAYSTACK INITIALIZE ERROR:", error.response?.data || error.message);
        
        res.status(500).json({ 
            error: 'Payment initialization failed',
            details: error.response?.data?.message || error.message 
        });
    }
};

// --- 2. VERIFY PAYMENT ---
exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        return res.status(400).json({ error: 'Transaction reference is required' });
    }

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`
                }
            }
        );

        // This sends the full verification status back to your frontend
        res.status(200).json(response.data);
    } catch (error) {
        console.error("PAYSTACK VERIFY ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};