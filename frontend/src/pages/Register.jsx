import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageTransition from '../components/PageTransition';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'client';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: initialRole,
    termsAccepted: false,
    privacyAccepted: false,
    acceptedPolicyVersion: '2026-02-11'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

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
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/register' 
        : '/api/auth/register';

      const res = await axios.post(API_URL, formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);
      
      toast.success("Account Created!");

      if (res.data.role === 'admin') navigate('/admin-dashboard');
      else if (res.data.role === 'artisan') navigate('/artisan-setup');
      else navigate('/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* REMOVED: bg-[#FAFBFF] dark:bg-[#0B0F1A]
        RESULT: Container is transparent, letting the Living Background (body) show through.
      */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        {/* LIVING BACKGROUND */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20 relative z-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
              Join <span className="text-blue-600">LinkUp</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
              {role === 'artisan' ? 'Create Professional Account' : 'Create Client Account'}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="username"
                value={username}
                placeholder="Username"
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm placeholder-gray-400 text-xs transition-all focus:bg-white dark:focus:bg-black/40"
                onChange={onChange}
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={email}
                placeholder="Email Address"
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm placeholder-gray-400 text-xs transition-all focus:bg-white dark:focus:bg-black/40"
                onChange={onChange}
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                placeholder="Password"
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm placeholder-gray-400 text-xs transition-all focus:bg-white dark:focus:bg-black/40"
                onChange={onChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 bottom-4 text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:text-blue-700 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" name="termsAccepted" checked={termsAccepted} onChange={onChange} className="mt-1 accent-blue-600" />
                <span>I agree to the <Link to="/terms" className="text-blue-600 font-black hover:underline">Terms & Agreement</Link>.</span>
              </label>
              <label className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" name="privacyAccepted" checked={privacyAccepted} onChange={onChange} className="mt-1 accent-blue-600" />
                <span>I agree to the <Link to="/privacy" className="text-blue-600 font-black hover:underline">Privacy Policy</Link>.</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs mt-4 disabled:opacity-50 transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Already verified? <Link to="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;