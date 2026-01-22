import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: IMMERSIVE BOOKING MODAL ---
const BookingModal = ({ artisan, onClose, themeColor }) => {
  const [bookingData, setBookingData] = useState({ date: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.description) {
      return toast.warn("Please fill in all details");
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/jobs/book' 
        : 'https://hireme-bk0l.onrender.com/api/jobs/book';

      await axios.post(API_URL, {
        artisanId: artisan._id,
        date: bookingData.date,
        description: bookingData.description
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Request sent to " + artisan.username);
      onClose();
    } catch (err) {
      toast.error("Booking failed. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 50, scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
      >
        <button onClick={onClose} className="absolute top-6 right-8 text-2xl font-black text-gray-400 hover:text-black z-50">×</button>

        {/* Left: Artisan Identity */}
        <div className="md:w-1/2 p-12 bg-gray-50 flex flex-col items-center justify-center text-center border-r border-gray-100">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-40 h-40 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl">
            <img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random&size=200`} className="w-full h-full object-cover" alt="" />
          </motion.div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{artisan.username}</h2>
          <p className="font-black text-xs uppercase tracking-[0.3em] mt-2" style={{ color: themeColor }}>{artisan.category}</p>
          <div className="mt-8 flex gap-3 text-[10px] font-black uppercase">
             <span className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">⭐ 5.0 Rating</span>
             <span className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">📍 {artisan.location || 'Accra'}</span>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-black mb-8 tracking-tight">SCHEDULE SERVICE</h3>
          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Appointment Date</label>
              <input 
                type="date" 
                className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 mt-2 transition-all font-bold text-gray-700 shadow-inner"
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                style={{ '--tw-ring-color': themeColor }}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Requirements</label>
              <textarea 
                placeholder="Describe the issue or project details..."
                className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 mt-2 h-32 transition-all font-medium shadow-inner"
                onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                style={{ '--tw-ring-color': themeColor }}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleBooking}
              disabled={loading}
              className="w-full py-6 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
              style={{ backgroundColor: themeColor, boxShadow: `0 20px 40px ${themeColor}33` }}
            >
              {loading ? "PROCESSING..." : `BOOK NOW — GHS ${artisan.price}/hr`}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN COMPONENT: DASHBOARD ---
const Dashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  
  const [activeTheme, setActiveTheme] = useState({
    name: 'All',
    color: 'rgb(37, 99, 235)',
    glow: 'rgba(37, 99, 235, 0.15)'
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
        const API_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000/api/artisan' 
          : 'https://hireme-bk0l.onrender.com/api/artisan';
        const res = await axios.get(API_URL);
        setArtisans(res.data);
      } catch (err) { toast.error("Error loading marketplace"); }
      finally { setLoading(false); }
    };
    fetchArtisans();
  }, []);

  const handleFilter = (cat) => {
    setFilter(cat.name);
    setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white font-black text-2xl uppercase tracking-tighter">
      Scanning Marketplace...
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F9FBFF] pb-32">
        <Navbar />

        {/* Dynamic Theme Glow Background */}
        <div 
          className="fixed top-0 left-0 w-full h-[600px] pointer-events-none transition-all duration-1000 z-0"
          style={{ background: `radial-gradient(circle at 50% -10%, ${activeTheme.glow} 0%, transparent 80%)` }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
          
          {/* Hero Header */}
          <div className="text-center mb-16">
            <motion.h1 layout className="text-7xl md:text-9xl font-black text-gray-900 leading-[0.85] tracking-tighter uppercase">
              Pro <br /> <span style={{ color: activeTheme.color }} className="italic transition-colors duration-500">{activeTheme.name}</span>
            </motion.h1>
            <p className="mt-8 text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Verified Professionals • Instant Booking</p>
          </div>

          {/* Liquid Dock */}
          <div className="flex justify-center mb-24">
            <motion.div className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200 border border-white flex gap-1 relative overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleFilter(cat)}
                  className={`relative z-10 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === cat.name ? 'text-white' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span> {cat.name}
                  {filter === cat.name && (
                    <motion.div layoutId="liquid-pill" className="absolute inset-0 -z-10 rounded-full" style={{ backgroundColor: cat.color }} transition={{ type: "spring", bounce: 0.3, duration: 0.6 }} />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Bento Grid Marketplace */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 auto-rows-[340px] gap-10">
            <AnimatePresence mode="popLayout">
              {artisans
                .filter(a => (filter === "All" || a.category === filter))
                .map((artisan, i) => (
                  <ArtisanCard 
                    key={artisan._id} 
                    artisan={artisan} 
                    index={i} 
                    themeColor={activeTheme.color}
                    onClick={() => setSelectedArtisan(artisan)}
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Booking Portal Overlay */}
        <AnimatePresence>
          {selectedArtisan && (
            <BookingModal 
              artisan={selectedArtisan} 
              themeColor={activeTheme.color} 
              onClose={() => setSelectedArtisan(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const ArtisanCard = ({ artisan, index, themeColor, onClick }) => {
  const isLarge = index % 5 === 0;

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className={`group bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer 
        ${isLarge ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1'}`}
      onClick={onClick}
    >
      <div>
        <div className="flex justify-between items-start mb-10">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
             <img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rate</p>
            <p className="text-xl font-black text-gray-900">GHS {artisan.price}</p>
          </div>
        </div>
        
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{artisan.username}</h3>
        <p className="font-black text-[10px] uppercase tracking-[0.2em] mt-3 opacity-40">{artisan.category}</p>
        <p className="text-gray-400 text-sm mt-6 leading-relaxed font-medium line-clamp-3">{artisan.bio || "Premium service provider verified by HireMe platform."}</p>
      </div>

      <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 mt-10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs shadow-lg" style={{ backgroundColor: themeColor }}>→</div>
        <span className="text-[10px] font-black uppercase tracking-widest">View Profile</span>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;