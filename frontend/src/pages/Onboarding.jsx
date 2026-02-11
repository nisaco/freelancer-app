import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';

const Onboarding = () => {
  const [profileImg, setProfileImg] = useState(null);
  const [ghanaCard, setGhanaCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://linkup-bk0l.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileImg || !ghanaCard) return toast.warn("Please upload both photos");

    setLoading(true);
    const formData = new FormData();
    formData.append('profilePic', profileImg);
    formData.append('ghanaCard', ghanaCard);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/auth/onboarding`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}` 
        }
      });
      toast.success("Verification documents submitted! Admin will review soon.");
    } catch (err) { 
      toast.error(err.response?.data?.message || "Upload failed. Check your connection."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 relative z-10 w-full flex justify-center pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/40 dark:border-white/10 shadow-2xl w-full max-w-xl"
          >
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mb-2">Artisan <span className="text-blue-600">Onboarding</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-12">Submit your credentials for Elite Verification</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Public Profile Picture</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setProfileImg(e.target.files[0])} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Ghana Card (Secret - Admin Only)</label>
                <input type="file" accept="image/*" onChange={(e) => setGhanaCard(e.target.files[0])} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/40 mt-8 disabled:opacity-50"
              >
                {loading ? "UPLOADING TO SECURE SERVER..." : "SUBMIT IDENTITY FOR REVIEW"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

// --- THIS LINE FIXES THE BUILD ERROR ---
export default Onboarding;
