import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const navigate = useNavigate();
  
  // Get the 'reference' code Paystack put in the URL
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      verifyTransaction(reference);
    }
  }, [reference]);

  const verifyTransaction = async (ref) => {
    try {
      // Call your backend to check with Paystack
      const res = await axios.get(`http://localhost:5000/api/payment/verify?reference=${ref}`);
      
      if (res.data.data.status === 'success') {
        setStatus('success');
        // Optional: Save "Paid" status to your database here if needed
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'verifying' && (
          <h2 className="text-xl font-bold text-blue-600">Verifying Payment... 🔄</h2>
        )}
        
        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful! ✅</h2>
            <p className="text-gray-600 mb-4">Reference: {reference}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Go Home
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed ❌</h2>
            <p className="text-gray-600">Please contact support.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;