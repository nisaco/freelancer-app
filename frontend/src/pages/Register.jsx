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
    role: 'client' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/register' 
        : 'https://hireme-bk0l.onrender.com/api/auth/register';

      const res = await axios.post(API_URL, formData);
      
      // Save user data and token
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      toast.success("Account created successfully!");

      // Navigate based on role
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 relative overflow-hidden">
        
        {/* Animated Background Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white z-10"
        >
          <div className="text-center mb-10">
            <motion.h2 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black text-gray-900 tracking-tighter"
            >
              JOIN <span className="text-blue-600">HIREME</span>
            </motion.h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Start your professional journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* ROLE SELECTOR - ALIVE VERSION */}
            <div className="flex gap-2 p-2 bg-gray-100/50 rounded-2xl mb-4">
              {['client', 'artisan'].map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    role === r 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {r}
                </motion.button>
              ))}
            </div>

            <motion.div whileFocus={{ scale: 1.01 }}>
              <input
                type="text"
                name="username"
                placeholder="Full Name / Business Name"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                value={username}
                onChange={onChange}
                required
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.01 }}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                value={email}
                onChange={onChange}
                required
              />
            </motion.div>

            <motion.div whileFocus={{ scale: 1.01 }} className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                value={password}
                onChange={onChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-4 text-[10px] font-black text-blue-600 uppercase tracking-tighter"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              {loading ? "Creating Account..." : "Join Platform"}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;