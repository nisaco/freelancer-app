import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: MOBILE-ADAPTIVE BOOKING MODAL ---
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

      const res = await axios.post(`${API_BASE}/payment/initialize`, {
        artisanId: artisan._id,
        amount: artisan.price, 
        date: bookingData.date,
        description: bookingData.description,
        category: artisan.category 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data.authorization_url) {
        toast.info("Connecting to Secure Payment...");
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      toast.error("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full md:max-w-4xl rounded-t-[3rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-t md:border border-white/40 max-h-[95vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-8 text-3xl font-light text-gray-400 hover:text-black z-50">×</button>
        
        <div className="flex flex-col md:flex-row w-full overflow-y-auto no-scrollbar">
          {/* Left Side: Profile */}
          <div className="md:w-5/12 p-8 md:p-12 bg-gray-50/50 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-4 shadow-xl border-4 border-white">
              <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">{artisan.username}</h2>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] mt-2" style={{ color: themeColor }}>{artisan.category}</p>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
            <h3 className="text-lg font-black mb-6 tracking-tight uppercase italic text-gray-800">Complete Booking</h3>
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Preferred Date</label>
                <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 font-bold text-gray-700 shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Details</label>
                <textarea placeholder="Tell the pro what you need..." className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 h-24 md:h-32 font-medium shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, description: e.target.value})} />
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleBooking} disabled={loading} className="w-full py-5 rounded-2xl text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl" style={{ backgroundColor: themeColor }}>
                {loading ? "CHECKING..." : `PAY GHS ${artisan.price}`}
              </motion.button>
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [activeTheme, setActiveTheme] = useState({ name: 'All', color: 'rgb(37, 99, 235)', glow: 'rgba(37, 99, 235, 0.15)' });

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
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
        const res = await axios.get(`${API_BASE}/artisan`);
        setArtisans(res.data);
      } catch (err) { toast.error("Marketplace sync failed"); }
      finally { setLoading(false); }
    };
    fetchArtisans();
  }, []);

  const filteredArtisans = artisans.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch = a.username.toLowerCase().includes(term) || a.category.toLowerCase().includes(term);
    const matchesCategory = filter === "All" || a.category === filter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-blue-600 animate-pulse">Syncing Marketplace...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFBFF] pb-24">
        <Navbar />
        
        {/* Dynamic Glow Effect */}
        <div className="fixed top-0 left-0 w-full h-[500px] pointer-events-none z-0" style={{ background: `radial-gradient(circle at 50% -5%, ${activeTheme.glow} 0%, transparent 80%)` }} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 relative z-10">
          
          {/* Mobile Search */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-12">
            <div className="relative flex items-center bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 p-1 md:p-2">
              <div className="pl-5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" placeholder="Search by name or skill..." className="w-full px-4 py-4 md:py-5 outline-none font-bold text-gray-700 bg-transparent text-sm md:text-base placeholder:text-gray-300" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Scrolling Category Dock */}
          <div className="flex justify-start md:justify-center mb-10 md:mb-20 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0">
            <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-full shadow-2xl shadow-gray-200/50 border border-white flex gap-1 flex-nowrap h-fit">
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => { setFilter(cat.name); setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` }); }}
                  className={`relative z-10 px-6 md:px-8 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${filter === cat.name ? 'text-white' : 'text-gray-400 hover:text-black'}`}>
                  {cat.icon} {cat.name}
                  {filter === cat.name && <motion.div layoutId="pill" className="absolute inset-0 -z-10 rounded-full" style={{ backgroundColor: cat.color }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Adaptive Bento Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[360px] gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredArtisans.map((artisan, i) => (
                <ArtisanCard key={artisan._id} artisan={artisan} index={i} themeColor={activeTheme.color} onClick={() => setSelectedArtisan(artisan)} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedArtisan && <BookingModal artisan={selectedArtisan} themeColor={activeTheme.color} onClose={() => setSelectedArtisan(null)} />}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const ArtisanCard = ({ artisan, index, themeColor, onClick }) => {
  // We only do the "Large" card span on Desktop (md breakpoint)
  const isLarge = index % 5 === 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`group bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col justify-between cursor-pointer 
      ${isLarge ? 'md:col-span-2 md:row-span-2' : 'col-span-1'} min-h-[320px] md:min-h-0`}>
      
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Rate</p>
            <p className="text-lg font-black text-gray-900 leading-none tracking-tighter">GHS {artisan.price}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-2">{artisan.username}</h3>
          <span className="text-[8px] font-black uppercase px-2 py-1 rounded-md bg-gray-50 text-gray-400 tracking-widest">{artisan.category}</span>
          <p className="text-gray-400 text-xs md:text-sm mt-4 leading-relaxed font-medium line-clamp-3 md:line-clamp-4 italic">
            {artisan.bio || "Quality service from a verified professional."}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Active</span>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shadow-xl transition-all group-hover:scale-110" style={{ backgroundColor: themeColor }}>→</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;