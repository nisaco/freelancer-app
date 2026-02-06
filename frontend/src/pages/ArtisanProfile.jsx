import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const ArtisanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        // Using your existing available jobs route to find this specific pro
        const res = await axios.get(`${API_BASE}/jobs/available`);
        const found = res.data.find(a => a._id === id);
        if (found) setArtisan(found);
        else toast.error("Artisan not found");
      } catch (err) {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();
  }, [id, API_BASE]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0B0F1A] font-black uppercase text-blue-600 animate-pulse">Scanning Profile...</div>;
  if (!artisan) return <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0B0F1A]">Profile Missing</div>;

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>

        <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-24 relative z-10 w-full pb-20">
          {/* HEADER CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-white/40 dark:border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-white/10 shadow-2xl">
              <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 inline-block">Verified Elite</span>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none mb-4">{artisan.username}</h1>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{artisan.category}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-10">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Session Rate</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white italic">GHS {artisan.price}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Reputation</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white italic">{artisan.rating || "5.0"} ★</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white italic">{artisan.location || "Accra"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BIO & ACTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="md:col-span-2 bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 dark:border-white/10"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic mb-6">About the Professional</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed italic font-medium">
                {artisan.bio || `${artisan.username} is a verified elite ${artisan.category} dedicated to providing premium craftsmanship across the region. With a focus on reliability and secure service, you can expect world-class results.`}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center text-center text-white"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-80">Ready to begin?</p>
              <h4 className="text-3xl font-black italic mb-8 uppercase tracking-tighter">Secure Your <br />Session</h4>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-5 bg-white text-blue-600 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                Book Now
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArtisanProfile;