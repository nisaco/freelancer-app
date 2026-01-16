const axios = require('axios');

exports.initializePayment = async (req, res) => {
  const { email, amount } = req.body;

  // Paystack expects amount in kobo (Result * 100)
  // Example: 10 GHS = 1000 kobo
  const params = {
    email: email,
    amount: amount * 100, 
    currency: 'GHS',
    callback_url: "https://hireme-bk0l.onrender.com/payment/callback" // We will build this later
  };

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Send the authorization URL back to the frontend
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};