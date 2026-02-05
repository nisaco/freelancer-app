import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: BOOKING MODAL ---
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
          <div className="md:w-5/12 p-8 md:p-12 bg-gray-50/50 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-4 shadow-xl border-4 border-white">
              <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">{artisan.username}</h2>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] mt-2" style={{ color: themeColor }}>{artisan.category}</p>
          </div>
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
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Marketplace"); 
  const [filter, setFilter] = useState("All");
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [activeTheme, setActiveTheme] = useState({ name: 'All', color: 'rgb(37, 99, 235)', glow: 'rgba(37, 99, 235, 0.15)' });

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';

  const categories = [
    { name: 'All', icon: '✦', color: 'rgb(37, 99, 235)' },
    { name: 'Electrician', icon: '⚡', color: 'rgb(234, 179, 8)' },
    { name: 'Plumber', icon: '💧', color: 'rgb(14, 165, 233)' },
    { name: 'Carpenter', icon: '🪵', color: 'rgb(120, 113, 108)' },
    { name: 'Painter', icon: '🎨', color: 'rgb(236, 72, 153)' },
    { name: 'Mason', icon: '🧱', color: 'rgb(248, 113, 113)' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // We call BOTH routes to ensure no 404s
      const [artRes, jobRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs/available`),
        axios.get(`${API_BASE}/jobs/client`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setArtisans(artRes.data);
      setMyJobs(jobRes.data);
    } catch (err) { 
      console.error(err);
      toast.error("Error loading dashboard data"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleConfirmCompletion = async (jobId) => {
    const rating = window.prompt("Rate the service (1-5):", "5");
    if (!rating) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/jobs/${jobId}`, { status: 'completed', rating: Number(rating) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Funds Released!");
      fetchData(); // Refresh everything
    } catch (err) { toast.error("Release failed."); }
  };

  const filteredArtisans = artisans.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch = a.username.toLowerCase().includes(term) || (a.category && a.category.toLowerCase().includes(term));
    const matchesCategory = filter === "All" || a.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFBFF] pb-24 font-sans">
        <Navbar />
        <div className="fixed top-0 left-0 w-full h-[500px] pointer-events-none z-0" style={{ background: `radial-gradient(circle at 50% -5%, ${activeTheme.glow} 0%, transparent 80%)` }} />
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 relative z-10">
          
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-2xl shadow-lg flex gap-1">
              {["Marketplace", "My Bookings"].map(v => (
                <button key={v} onClick={() => setView(v === "Marketplace" ? "Marketplace" : "My Jobs")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === (v === "Marketplace" ? "Marketplace" : "My Jobs") ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "Marketplace" ? (
              <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-2xl mx-auto mb-12">
                  <div className="bg-white rounded-[2rem] shadow-xl p-2 flex items-center border border-gray-100">
                    <div className="pl-5 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    <input type="text" placeholder="Search for professionals..." className="w-full px-4 py-4 outline-none font-bold text-gray-700 bg-transparent" onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                {/* CATEGORIES */}
                <div className="flex justify-start md:justify-center mb-16 overflow-x-auto no-scrollbar">
                  <div className="bg-white/80 p-2 rounded-full border border-white flex gap-1 shadow-2xl">
                    {categories.map((cat) => (
                      <button key={cat.name} onClick={() => { setFilter(cat.name); setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` }); }}
                        className={`relative z-10 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${filter === cat.name ? 'text-white' : 'text-gray-400'}`}>
                        {cat.icon} {cat.name}
                        {filter === cat.name && <motion.div layoutId="pill" className="absolute inset-0 -z-10 rounded-full" style={{ backgroundColor: cat.color }} />}
                      </button>
                    ))}
                  </div>
                </div>
                {/* BENTO GRID */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {filteredArtisans.map((artisan, i) => (
                    <ArtisanCard key={artisan._id} artisan={artisan} index={i} themeColor={activeTheme.color} onClick={() => setSelectedArtisan(artisan)} />
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-10 italic text-gray-900">Active Bookings</h2>
                {myJobs.length > 0 ? myJobs.map(job => (
                  <div key={job._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border">
                        <img src={job.artisan?.profilePic || `https://ui-avatars.com/api/?name=${job.artisan?.username}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{job.artisan?.username || 'Guest Pro'}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">📞 {job.artisan?.phone || 'No Phone'}</p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                       <p className={`text-[8px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full inline-block ${job.status === 'awaiting_confirmation' ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                         {job.status.replace('_', ' ')}
                       </p>
                       <div className="flex items-center gap-4 mt-2">
                         <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">GHS {job.amount || job.price}</span>
                         {job.status === 'awaiting_confirmation' && (
                           <button onClick={() => handleConfirmCompletion(job._id)} className="bg-green-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-black transition-all">
                             Confirm & Release
                           </button>
                         )}
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">No bookings found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`group bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm flex flex-col justify-between cursor-pointer ${isLarge ? 'md:col-span-2 md:row-span-1' : 'col-span-1'} hover:shadow-2xl transition-all`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
            <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" />
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Session</p>
            <p className="text-lg font-black text-gray-900 tracking-tighter italic">GHS {artisan.price}</p>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1 uppercase">{artisan.username}</h3>
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{artisan.category}</p>
          <p className="text-gray-400 text-xs mt-4 line-clamp-3 font-medium italic leading-relaxed">{artisan.bio || "Verified professional."}</p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${artisan.isVerified ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest">{artisan.isVerified ? 'Verified' : 'Active'}</span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-lg transition-all group-hover:bg-black" style={{ backgroundColor: themeColor }}>→</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;