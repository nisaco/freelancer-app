import React, { useState } from 'react';
import axios from 'axios';

const PayButton = ({ email, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Get the User Token (if you are logged in)
      const token = localStorage.getItem('token'); 

      // 2. Request a Payment Link from our Backend
      // Note: amount is in GHS. Backend converts to kobo.
      const response = await axios.post(
        'http://localhost:5000/api/payment/pay', 
        { email, amount },
        {
          headers: {
            Authorization: `Bearer ${token}` // Send token if your route is protected
          }
        }
      );

      // 3. Redirect user to Paystack
      const paystackUrl = response.data.data.authorization_url;
      window.location.href = paystackUrl;

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed to initialize.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
    >
      {loading ? 'Processing...' : `Pay GHS ${amount}`}
    </button>
  );
};

export default PayButton;