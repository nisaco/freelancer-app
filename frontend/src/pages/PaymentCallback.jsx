import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
        const res = await axios.get(`${API_BASE}/payment/callback?reference=${reference}`);
        
        if (res.data.status === 'success' || res.data.data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        setStatus('failed');
      }
    };
    if (reference) verifyPayment();
  }, [reference]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full text-center">
          {status === 'verifying' && (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="text-blue-600 font-black uppercase tracking-widest">
              Confirming Secure Payment...
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-green-100">✓</div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Success!</h1>
              <p className="text-gray-400 font-medium mb-10 leading-relaxed">Your professional is now notified and preparing for your request. Check your dashboard for updates.</p>
              <button onClick={() => navigate('/dashboard')} className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Back to Marketplace</button>
            </motion.div>
          )}

          {status === 'failed' && (
            <div>
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 font-black">!</div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">PAYMENT FAILED</h1>
              <button onClick={() => navigate('/dashboard')} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PaymentCallback;