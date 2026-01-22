import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: GLASSMOPHIC BOOKING MODAL ---
const BookingModal = ({ artisan, onClose, themeColor }) => {
  const [bookingData, setBookingData] = useState({ date: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.description) {
      return toast.warn("Please provide a date and description");
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://hireme-bk0l.onrender.com/api';

      // Initialize Paystack + Create Pending Job
      const res = await axios.post(`${API_BASE}/payment/initialize`, {
        artisanId: artisan._id,
        amount: artisan.price, 
        date: bookingData.date,
        description: bookingData.description,
        category: artisan.category // ADD THIS LINE
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data.authorization_url) {
        toast.info("Connecting to Secure Payment...");
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      toast.error("Booking initialization failed. Check backend routes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 50, scale: 0.95, opacity: 0 }}
        className="bg-white/90 backdrop-blur-2xl w-full max-w-sm md:max-w-4xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row relative border border-white/40"
      >
        <button onClick={onClose} className="absolute top-5 right-7 text-3xl font-light text-gray-400 hover:text-black z-50">×</button>

        <div className="flex flex-col md:flex-row w-full max-h-[85vh] overflow-y-auto md:overflow-visible">
          
          {/* Left: Artisan Profile Info */}
          <div className="md:w-5/12 p-8 md:p-12 bg-gray-50/40 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-6 shadow-2xl border-4 border-white">
              <img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random&size=200`} className="w-full h-full object-cover" alt="" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{artisan.username}</h2>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] mt-3" style={{ color: themeColor }}>{artisan.category}</p>
          </div>

          {/* Right: Booking Actions */}
          <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
            <h3 className="text-lg md:text-xl font-black mb-8 tracking-tight uppercase italic">Confirm Booking</h3>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Appointment Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-white/50 rounded-2xl border border-gray-100 outline-none focus:ring-2 mt-2 transition-all font-bold text-gray-700 shadow-sm"
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  style={{ '--tw-ring-color': themeColor }}
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Details</label>
                <textarea 
                  placeholder="What needs fixing?"
                  className="w-full p-4 bg-white/50 rounded-2xl border border-gray-100 outline-none focus:ring-2 mt-2 h-24 md:h-32 transition-all font-medium shadow-sm"
                  onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                  style={{ '--tw-ring-color': themeColor }}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                disabled={loading}
                className="w-full py-5 md:py-6 rounded-2xl text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
                style={{ backgroundColor: themeColor, boxShadow: `0 15px 35px ${themeColor}44` }}
              >
                {loading ? "PROCESSING..." : `PAY & CONFIRM — GHS ${artisan.price}`}
              </motion.button>
              <p className="text-center text-[8px] font-bold text-gray-300 uppercase tracking-widest">Secured by Paystack</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN DASHBOARD ---
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
      } catch (err) { toast.error("Marketplace sync failed"); }
      finally { setLoading(false); }
    };
    fetchArtisans();
  }, []);

  const handleFilter = (cat) => {
    setFilter(cat.name);
    setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` });
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-300 tracking-widest">Opening Marketplace...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFBFF] pb-32">
        <Navbar />
        <div 
          className="fixed top-0 left-0 w-full h-[500px] pointer-events-none transition-all duration-1000 z-0"
          style={{ background: `radial-gradient(circle at 50% -5%, ${activeTheme.glow} 0%, transparent 80%)` }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
          <div className="text-center mb-12">
            <motion.h1 layout className="text-6xl md:text-9xl font-black text-gray-900 leading-[0.8] tracking-tighter uppercase">
              Elite <br /> <span style={{ color: activeTheme.color }} className="italic transition-colors duration-500">{activeTheme.name}</span>
            </motion.h1>
          </div>

  {/* --- LIQUID CATEGORY DOCK --- */}
<div className="flex justify-center mb-20 px-4">
  <motion.div 
    className="bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white flex flex-nowrap overflow-x-auto no-scrollbar max-w-full gap-1 relative"
  >
    {categories.map((cat) => (
      <motion.button
        key={cat.name}
        onClick={() => handleFilter(cat)}
        // flex-shrink-0 is the secret sauce here!
        className={`relative z-10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 flex-shrink-0 ${
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

          {/* Responsive Bento Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 auto-rows-[340px] md:auto-rows-[360px] gap-8 md:gap-10">
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
      layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -12 }}
      className={`group bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer 
        ${isLarge ? 'md:col-span-2 md:row-span-2 h-full' : 'md:col-span-1'}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
             <img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Rate</p>
            <p className="text-lg font-black text-gray-900">GHS {artisan.price}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors truncate">{artisan.username}</h3>
          <p className="font-black text-[9px] uppercase tracking-[0.2em] mt-2 opacity-40">{artisan.category}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-5 leading-relaxed font-medium line-clamp-3 md:line-clamp-5">
            {artisan.bio || "Premium service professional ready to deliver top-tier results for your project."}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg" style={{ backgroundColor: themeColor }}>→</div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">View & Book</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;