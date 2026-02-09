import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome = () => {
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
          HIREME
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
            📍 Premium Artisans Across Ghana
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
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">✅</div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Verified Pros</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Background Checked</p>
                  </div>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
                
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-2xl shadow-xl group-hover:-rotate-12 transition-transform">🛡️</div>
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
    </div>
  );
};

export default Welcome;