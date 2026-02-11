import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageTransition from '../components/PageTransition';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client',
    termsAccepted: false,
    privacyAccepted: false,
    acceptedPolicyVersion: '2026-02-11'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, role, termsAccepted, privacyAccepted } = formData;

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      return toast.error("Accept Terms and Privacy Policy to continue");
    }
    setLoading(true);
    try {
      // KEEPING YOUR LOGIC: Dynamic API URL switching
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/register' 
        : 'https://linkup-bk0l.onrender.com/api/auth/register';

      const res = await axios.post(API_URL, formData);
      
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      toast.success("Identity Synchronized. Welcome!");

      // KEEPING YOUR LOGIC: Role-based navigation
      if (res.data.role === 'artisan') {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
        
        {/* 1. THE LIVING BACKGROUND (Integrated with your Landing Page) */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 w-full max-w-xl"
        >
          {/* 2. THE GLASS CARD */}
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[3rem] p-10 lg:p-12 shadow-2xl">
            
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                JOIN <span className="text-blue-600">LINKUP</span>
              </h2>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-2">
                Start your professional journey
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* ROLE SELECTOR - REFINED VERSION */}
              <div className="flex gap-2 p-2 bg-white/30 dark:bg-black/20 rounded-2xl mb-6 border border-white/20">
                {['client', 'artisan'].map((r) => (
                  <motion.button
                    key={r}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      role === r 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Identity Name</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Full / Business Name"
                    className="w-full mt-2 px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                    value={username}
                    onChange={onChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@email.com"
                    className="w-full mt-2 px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Secret Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full mt-2 px-6 py-4 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                  value={password}
                  onChange={onChange}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 bottom-4 text-[10px] font-black text-blue-600 uppercase tracking-tighter"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !termsAccepted || !privacyAccepted}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs mt-4 disabled:opacity-50"
              >
                {loading ? "Establishing Identity..." : "Join Platform"}
              </motion.button>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={termsAccepted}
                    onChange={onChange}
                    className="mt-1"
                  />
                  <span>
                    I agree to the <Link to="/terms" className="text-blue-600 font-black">Terms & Agreement</Link>.
                  </span>
                </label>
                <label className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    checked={privacyAccepted}
                    onChange={onChange}
                    className="mt-1"
                  />
                  <span>
                    I agree to the <Link to="/privacy" className="text-blue-600 font-black">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            </form>

            <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Already verified? <Link to="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;

