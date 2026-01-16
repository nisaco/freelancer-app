import React from 'react';
import axios from 'axios';

const PayButton = ({ amount, email }) => {
  
  const handlePayment = async () => {
    try {
      // 1. Setup the Backend URL based on where the app is running
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/payment/pay' 
        : 'https://hireme-bk0l.onrender.com/api/payment/pay';

      // 2. Call your backend to initialize payment
      // Note: Paystack takes amount in Pesewas, but our backend handles the *100
      const response = await axios.post(API_BASE_URL, {
        amount,
        email,
      });

      // 3. Redirect user to the Paystack Checkout URL
      if (response.data && response.data.data.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      } else {
        alert("Could not initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment Error:", error.response?.data || error.message);
      alert("Payment failed to initialize. Check your connection.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
    >
      <span>Pay GHS {amount}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export default PayButton;