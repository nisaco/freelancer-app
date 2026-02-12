import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify'; // Replaced alert with toast for sophistication
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
      // KEEPING YOUR LOGIC: Localhost vs Render switch
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'https://linkupgh.live/api/auth/login';

      const res = await axios.post(API_URL, formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      toast.success("Access Granted");

      // KEEPING YOUR LOGIC: Role-based navigation
      if (res.data.role === 'admin') navigate('/admin-dashboard');
      else if (res.data.role === 'artisan') navigate('/artisan-dashboard');
      else navigate('/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden transition-colors duration-700">
        
        {/* 1. THE LIVING BACKGROUND (Unified across the whole site) */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* 2. THE GLASS CARD */}
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[3rem] p-10 lg:p-12 shadow-2xl">
            
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                WELCOME <span className="text-blue-600">BACK</span>
              </h2>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-2">
                Secure Portal Access
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="group">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Email Identity</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full mt-2 px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Access Key</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full mt-2 px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 bottom-4 text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:text-blue-800 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)" }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs mt-4 disabled:opacity-50"
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </motion.button>
            </form>

            <p className="text-center mt-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
              New here? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-black hover:underline">Create Identity</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;

