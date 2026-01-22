import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion'; // Big time animations
import PageTransition from '../components/PageTransition';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'https://hireme-bk0l.onrender.com/api/auth/login';

      const res = await axios.post(API_URL, formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      if (res.data.role === 'admin') navigate('/admin-dashboard');
      else if (res.data.role === 'artisan') navigate('/artisan-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4">
        {/* Floating Decorative Blobs for Depth */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 z-10"
        >
          <motion.h2 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-black text-center mb-2 tracking-tighter text-gray-900"
          >
            WELCOME <span className="text-blue-600">BACK</span>
          </motion.h2>
          <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mb-10">Enter your credentials to continue</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <motion.div whileFocus={{ scale: 1.02 }} className="group">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-4 text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:text-blue-800 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 20px 30px rgba(37, 99, 235, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            New here? <Link to="/register" className="text-blue-600 font-black hover:underline">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;