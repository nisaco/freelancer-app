import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const Dashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  // Theme State - This changes the "vibe" of the app dynamically
  const [activeTheme, setActiveTheme] = useState({
    name: 'All',
    color: 'rgb(37, 99, 235)', // Default Blue
    glow: 'rgba(37, 99, 235, 0.2)'
  });

  const categories = [
    { name: 'All', icon: '✦', color: 'rgb(37, 99, 235)' },
    { name: 'Electrician', icon: '⚡', color: 'rgb(234, 179, 8)' },
    { name: 'Plumber', icon: '💧', color: 'rgb(14, 165, 233)' },
    { name: 'Carpenter', icon: '🪵', color: 'rgb(120, 113, 108)' },
    { name: 'Painter', icon: '🎨', color: 'rgb(236, 72, 153)' },
    { name: 'Mason', icon: '🧱', color: 'rgb(248, 113, 113)' }
  ];

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const res = await axios.get('/api/artisan');
        setArtisans(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchArtisans();
  }, []);

  const handleFilter = (cat) => {
    setFilter(cat.name);
    setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}33` });
  };

  return (
    <PageTransition>
      <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: '#FDFDFF' }}>
        <Navbar />

        {/* Dynamic Background Glow */}
        <div 
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none transition-all duration-1000"
          style={{ background: `radial-gradient(circle at 50% 0%, ${activeTheme.glow} 0%, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
          
          {/* --- HERO SECTION --- */}
          <div className="mb-12 text-center">
            <motion.h1 
              layout
              className="text-6xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter"
            >
              HIRE A <br />
              <motion.span 
                key={activeTheme.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ color: activeTheme.color }}
                className="italic uppercase"
              >
                {activeTheme.name === 'All' ? 'PRO' : activeTheme.name}
              </motion.span>
            </motion.h1>
          </div>

          {/* --- LIQUID CATEGORY DOCK --- */}
          <div className="flex justify-center mb-20">
            <motion.div 
              className="bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white flex gap-1 relative overflow-hidden"
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat.name}
                  onClick={() => handleFilter(cat)}
                  className={`relative z-10 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors duration-500 ${
                    filter === cat.name ? 'text-white' : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                  
                  {filter === cat.name && (
                    <motion.div 
                      layoutId="liquid-bg"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* --- BENTO GRID MARKETPLACE --- */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 auto-rows-[320px] gap-8">
            <AnimatePresence mode="popLayout">
              {artisans
                .filter(a => (filter === "All" || a.category === filter))
                .filter(a => a.category.toLowerCase().includes(search.toLowerCase()))
                .map((artisan, i) => (
                  <ArtisanCard 
                    key={artisan._id} 
                    artisan={artisan} 
                    index={i} 
                    themeColor={activeTheme.color}
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

// --- THE INTERACTIVE BENTO TILE ---
const ArtisanCard = ({ artisan, index, themeColor }) => {
  const isLarge = index % 5 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className={`relative group bg-white rounded-[3rem] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between 
        ${isLarge ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1'}`}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeColor, opacity: 0.1 }} />
      
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
             <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Starting at</span>
            <span className="text-lg font-black text-gray-900">GHS {artisan.price}</span>
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
          {artisan.username}
        </h3>
        <div className="flex items-center gap-2 mt-2 mb-4">
           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
           <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">{artisan.category}</p>
        </div>
        
        <p className="text-gray-400 text-sm leading-relaxed font-medium">
          {artisan.bio || "Top-rated professional ready to assist with your next project."}
        </p>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        style={{ backgroundColor: themeColor }}
        className="w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 transition-transform flex items-center justify-center gap-2"
      >
        View Profile <span>→</span>
      </motion.button>
    </motion.div>
  );
};

export default Dashboard;