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

      const res = await axios.post(`${API_BASE}/payment/initialize`, {
        artisanId: artisan._id,
        amount: artisan.price, 
        date: bookingData.date,
        description: bookingData.description,
        category: artisan.category // Added for validation
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data.authorization_url) {
        toast.info("Connecting to Secure Payment...");
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      toast.error("Booking failed. Ensure backend Job model is updated.");
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
          <div className="md:w-5/12 p-8 md:p-12 bg-gray-50/40 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-6 shadow-2xl border-4 border-white">
              <img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{artisan.username}</h2>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] mt-3" style={{ color: themeColor }}>{artisan.category}</p>
          </div>
          <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
            <h3 className="text-lg md:text-xl font-black mb-8 tracking-tight uppercase italic">Confirm Booking</h3>
            <div className="space-y-6">
              <input type="date" className="w-full p-4 bg-white/50 rounded-2xl border border-gray-100 outline-none focus:ring-2 font-bold text-gray-700 shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
              <textarea placeholder="What needs fixing?" className="w-full p-4 bg-white/50 rounded-2xl border border-gray-100 outline-none focus:ring-2 h-24 md:h-32 font-medium shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, description: e.target.value})} />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBooking} disabled={loading} className="w-full py-5 md:py-6 rounded-2xl text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl transition-all" style={{ backgroundColor: themeColor }}>
                {loading ? "PROCESSING..." : `PAY & CONFIRM — GHS ${artisan.price}`}
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
  const [search, setSearch] = useState(""); // Universal Search State
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

  // --- UNIVERSAL FILTERING LOGIC ---
  const filteredArtisans = artisans.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch = a.username.toLowerCase().includes(term) || 
                         a.category.toLowerCase().includes(term) ||
                         a.location?.toLowerCase().includes(term) ||
                         a.price.toString().includes(term);
    const matchesCategory = filter === "All" || a.category === filter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-gray-300 tracking-widest">Opening Marketplace...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFBFF] pb-32">
        <Navbar />
        <div className="fixed top-0 left-0 w-full h-[500px] pointer-events-none transition-all duration-1000 z-0" style={{ background: `radial-gradient(circle at 50% -5%, ${activeTheme.glow} 0%, transparent 80%)` }} />

        <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
          
          {/* Universal Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <motion.div whileFocus-within={{ scale: 1.02 }} className="relative flex items-center bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-2">
              <div className="pl-6 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
              <input type="text" placeholder="Search name, price, or skill..." className="w-full px-4 py-4 outline-none font-bold text-gray-700 bg-transparent placeholder:text-gray-300" onChange={(e) => setSearch(e.target.value)} />
            </motion.div>
          </div>

          {/* Liquid Category Dock - FIXED FOR MOBILE SCROLL */}
          <div className="flex justify-center mb-20 overflow-x-auto no-scrollbar py-2 px-2">
            <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white flex gap-1 flex-nowrap">
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => { setFilter(cat.name); setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` }); }}
                  className={`relative z-10 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${filter === cat.name ? 'text-white' : 'text-gray-400 hover:text-black'}`}>
                  {cat.icon} {cat.name}
                  {filter === cat.name && <motion.div layoutId="pill" className="absolute inset-0 -z-10 rounded-full" style={{ backgroundColor: cat.color }} transition={{ type: "spring", bounce: 0.3, duration: 0.6 }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Bento Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-4 auto-rows-[340px] md:auto-rows-[360px] gap-8">
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
  const isLarge = index % 5 === 0;
  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} whileHover={{ y: -12 }} onClick={onClick}
      className={`group bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col justify-between cursor-pointer ${isLarge ? 'md:col-span-2 md:row-span-2 h-full' : 'md:col-span-1'}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100"><img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" /></div>
          <div className="text-right"><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Rate</p><p className="text-lg font-black text-gray-900">GHS {artisan.price}</p></div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none truncate">{artisan.username}</h3>
          <p className="font-black text-[9px] uppercase tracking-[0.2em] mt-2 opacity-40">{artisan.category}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-5 leading-relaxed font-medium line-clamp-3">{artisan.bio || "Premium service professional."}</p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg" style={{ backgroundColor: themeColor }}>→</div>
          <span className="text-[9px] font-black uppercase tracking-widest">View & Book</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
