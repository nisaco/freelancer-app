const axios = require('axios');

exports.initializePayment = async (req, res) => {
    const { email, amount } = req.body;

    // 1. SAFETY CHECK: Is the key actually loading?
    if (!process.env.PAYSTACK_SECRET_KEY) {
        console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing from environment variables!");
        return res.status(500).json({ error: 'Server Configuration Error: Missing API Key' });
    }

    // 2. DATA CHECK: Paystack needs email and an integer amount > 0
    if (!email || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid email and amount are required' });
    }

    const params = {
        email: email,
        amount: Math.round(amount * 100), // Ensure it is an integer (Pesewas)
        currency: 'GHS',
        callback_url: "https://hireme-bk0l.onrender.com/payment/callback"
    };

    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            params,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY.trim()}`, // .trim() removes accidental spaces
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        // This will print the EXACT reason from Paystack in your Render Logs
        console.error("Paystack Error Details:", error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || 'Payment initialization failed';
        res.status(error.response?.status || 500).json({ error: errorMessage });
    }
};