import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Welcome = () => {
  const [featuredArtisans, setFeaturedArtisans] = useState([]);

  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/featured`);
        setFeaturedArtisans(res.data || []);
      } catch (error) {
        setFeaturedArtisans([]);
      }
    };
    fetchFeatured();
  }, [API_BASE]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden transition-colors duration-700">
      {/* 1. THE LIVING BACKGROUND (From your index.css) */}
      <div className="living-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* --- NAV BAR --- */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto w-full">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter italic"
        >
          LINKUP
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-8"
        >
          <Link to="/login" className="text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600 transition text-sm uppercase tracking-widest">Login</Link>
          <Link to="/register" className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* --- MAIN HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-grow">
        
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 inline-block"
          >
            Premium Artisans Across Ghana
          </motion.span>
          
          <h2 className="text-6xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.9] mb-8 uppercase italic tracking-tighter">
            Expert <br /> 
            <span className="text-blue-600 relative">
              Artisans.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span>
            <br /> On Demand.
          </h2>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 leading-relaxed max-w-lg font-medium">
            Don't stress over Domestic, Industrial and commercial challenges anymore the professional are here!!
Anything Construction, Carpentry, Electrical, Air-conditioning / Refrigerating, Plumbing Electronics, IT, Painting, Deco, 
Cleaning Services etc. Just Sign up as Artisan to be in business or Client to enjoy the first Class professional Service we provide.
 <span className="text-gray-900 dark:text-white font-bold">Connect</span> today and your stressful moments are over with just a click. <span className="text-gray-900 dark:text-white font-bold"> Terms and Conditions</span> applied.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-300 dark:shadow-blue-900/20 transition-all"
              >
                Find an Artisan
              </motion.button>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 border-4 border-white dark:border-darkBg shadow-lg overflow-hidden"
                  >
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="artisan" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">500+ Verified <br />Pros in Accra</p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT VISUAL - GLASSMORPHISM CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Main Glass Card */}
          <div className="relative z-10 bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[4rem] p-10 lg:p-16 shadow-2xl shadow-blue-500/10">
             <div className="space-y-10">
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Verified Pros</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Background Checked</p>
                  </div>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
                
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-2xl shadow-xl group-hover:-rotate-12 transition-transform">
                    <svg className="w-8 h-8 text-gray-800 dark:text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Secure Escrow</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Payment Protection</p>
                  </div>
                </div>

                <motion.p 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase text-center tracking-[0.5em] pt-4"
                >
                  "The best way to hire in Ghana"
                </motion.p>
             </div>
          </div>

          {/* Decorative Floating Blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        </motion.div>
      </main>

      <section className="relative z-10 max-w-7xl mx-auto w-full px-8 pb-24">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400 mb-3">Trusted Picks</p>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
              Featured Artisans
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-xl font-medium">
              Top-rated pros with 4.5+ stars and at least 5 completed jobs.
            </p>
          </div>
          <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-5 py-3 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-colors">
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredArtisans.length > 0 ? featuredArtisans.map((artisan) => (
            <motion.div
              key={artisan._id}
              whileHover={{ y: -4 }}
              className="rounded-[2rem] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5 shadow-xl"
            >
              <div className="w-full h-44 rounded-[1.5rem] overflow-hidden mb-4">
                <img
                  src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`}
                  alt={artisan.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">{artisan.category || 'General Service'}</p>
              <h4 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white truncate">
                {artisan.username}
              </h4>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-2">
                * {Number(artisan.rating || 0).toFixed(1)} | {artisan.completedJobs || 0} completed jobs
              </p>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                {artisan.location || 'Accra, Ghana'}
              </p>
              <p className="mt-4 text-lg font-black text-gray-900 dark:text-white">GHS {artisan.price || 0}</p>
            </motion.div>
          )) : (
            <div className="col-span-full rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">No featured artisans yet</p>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 px-8 pb-8">
        <div className="max-w-7xl mx-auto border-t border-white/30 dark:border-white/10 pt-5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Copyright © {new Date().getFullYear()} LinkUp Gh. All rights reserved | Developed by J3Cube.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;



