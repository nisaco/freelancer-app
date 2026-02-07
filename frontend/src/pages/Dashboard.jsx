import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

// --- SUB-COMPONENT: REVIEW MODAL (New Elite Addition) ---
const ReviewModal = ({ isOpen, onClose, onConfirm, artisanName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-lg p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] p-10 border border-white/20 shadow-2xl"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-2">Rate {artisanName}</h2>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8">Help the community by sharing your experience</p>
        
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className={`text-4xl transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-gray-700'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea 
          placeholder="Describe the service (optional)..."
          className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium dark:text-white mb-6 h-32"
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400">Cancel</button>
          <button 
            onClick={() => onConfirm(rating, comment)}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
          >
            Submit Review
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENT: BOOKING MODAL (Your Logic Preserved) ---
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
      className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-8 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-2xl w-full md:max-w-4xl rounded-t-[3rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-t md:border border-white/40 max-h-[95vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-8 text-3xl font-light text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white z-50 transition-colors">×</button>
        <div className="flex flex-col md:flex-row w-full overflow-y-auto no-scrollbar">
          <div className="md:w-5/12 p-8 md:p-12 bg-gray-50/50 dark:bg-black/20 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden mb-6 shadow-2xl border-4 border-white dark:border-white/10">
              <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{artisan.username}</h2>
            <p className="font-black text-[9px] uppercase tracking-[0.4em] mt-3" style={{ color: themeColor }}>{artisan.category}</p>
          </div>
          <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
            <h3 className="text-xl font-black mb-8 tracking-tighter uppercase italic text-gray-800 dark:text-gray-200">Complete Booking</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Preferred Date</label>
                <input type="date" className="w-full p-5 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/5 outline-none focus:ring-2 font-bold text-gray-700 dark:text-white shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Details</label>
                <textarea placeholder="Tell the pro what you need..." className="w-full p-5 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/20 dark:border-white/5 outline-none focus:ring-2 h-24 md:h-32 font-medium text-gray-700 dark:text-gray-200 shadow-sm" style={{ '--tw-ring-color': themeColor }} onChange={(e) => setBookingData({...bookingData, description: e.target.value})} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBooking} disabled={loading} className="w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all" style={{ backgroundColor: themeColor }}>
                {loading ? "INITIALIZING SECURE LINK..." : `CONFIRM GHS ${artisan.price}`}
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
  const navigate = useNavigate();  
  const [artisans, setArtisans] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Marketplace"); 
  const [filter, setFilter] = useState("All");
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [reviewingJob, setReviewingJob] = useState(null); // State for the job being reviewed
  const [activeTheme, setActiveTheme] = useState({ name: 'All', color: '#2563EB', glow: 'rgba(37, 99, 235, 0.15)' });

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';

  const categories = [
    { name: 'All', icon: '✦', color: '#2563EB' },
    { name: 'Electrician', icon: '⚡', color: '#EAB308' },
    { name: 'Plumber', icon: '💧', color: '#0EA5E9' },
    { name: 'Carpenter', icon: '🪵', color: '#78716C' },
    { name: 'Painter', icon: '🎨', color: '#EC4899' },
    { name: 'Mason', icon: '🧱', color: '#F87171' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const handleConfirmCompletion = async (rating, comment) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/jobs/${reviewingJob._id}`, { 
        status: 'completed', 
        rating: Number(rating),
        comment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Funds Released!");
      setReviewingJob(null); // Close modal
      fetchData(); 
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
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 relative z-10 w-full">
          
          <div className="flex justify-center mb-16">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-2xl flex gap-1">
              {["Marketplace", "My Bookings"].map(v => {
                const isSelected = view === (v === "Marketplace" ? "Marketplace" : "My Jobs");
                return (
                  <button key={v} onClick={() => setView(v === "Marketplace" ? "Marketplace" : "My Jobs")} 
                    className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                    {v}
                  </button>
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "Marketplace" ? (
              <motion.div key="market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-2 flex items-center border border-white/40 dark:border-white/10 transition-all focus-within:border-blue-500/50">
                    <div className="pl-6 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    <input type="text" placeholder="Search for professionals..." className="w-full px-5 py-5 outline-none font-bold text-gray-700 dark:text-white bg-transparent placeholder:text-gray-300" onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-start md:justify-center mb-20 overflow-x-auto no-scrollbar px-4">
                  <div className="bg-white/30 dark:bg-black/20 p-2 rounded-full border border-white/20 flex gap-2 shadow-2xl backdrop-blur-md">
                    {categories.map((cat) => (
                      <button key={cat.name} onClick={() => { setFilter(cat.name); setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` }); }}
                        className={`relative z-10 px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0 transition-all ${filter === cat.name ? 'text-white' : 'text-gray-400'}`}>
                        <span className="mr-2">{cat.icon}</span> {cat.name}
                        {filter === cat.name && <motion.div layoutId="pill" className="absolute inset-0 -z-10 rounded-full shadow-lg" style={{ backgroundColor: cat.color }} />}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.div layout className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                  {filteredArtisans.map((artisan, i) => (
                    <ArtisanCard key={artisan._id} artisan={artisan} index={i} themeColor={activeTheme.color} />
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="jobs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8 pb-20">
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-12 italic text-gray-900 dark:text-white">Active <span className="text-blue-600">Bookings</span></h2>
                {myJobs.length > 0 ? myJobs.map(job => (
                  <div key={job._id} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-center group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-gray-800 overflow-hidden border-2 border-white dark:border-white/10 shadow-lg">
                        <img src={job.artisan?.profilePic || `https://ui-avatars.com/api/?name=${job.artisan?.username}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">{job.artisan?.username || 'Guest Pro'}</h4>
                        <div className="flex gap-3 mt-2">
                           <button onClick={() => navigate(`/messages/${job.artisan?._id}`)} className="text-[8px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg">Message</button>
                           <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] self-center">GHS {job.amount || job.price}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end mt-6 md:mt-0 gap-4">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full ${job.status === 'awaiting_confirmation' ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                          {job.status.replace('_', ' ')}
                        </p>
                        {job.status === 'awaiting_confirmation' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setReviewingJob(job)} 
                            className="bg-green-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-green-500/30 hover:bg-black transition-all"
                          >
                            Release Funds
                          </motion.button>
                        )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-24 bg-white/20 dark:bg-black/10 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/20">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.5em]">No bookings found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL SECTION */}
        <AnimatePresence>
          {selectedArtisan && <BookingModal artisan={selectedArtisan} themeColor={activeTheme.color} onClose={() => setSelectedArtisan(null)} />}
          {reviewingJob && (
            <ReviewModal 
              isOpen={!!reviewingJob} 
              artisanName={reviewingJob.artisan?.username} 
              onClose={() => setReviewingJob(null)} 
              onConfirm={handleConfirmCompletion} 
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const ArtisanCard = ({ artisan, index, themeColor }) => {
  const navigate = useNavigate();
  const isLarge = index % 5 === 0;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -10 }} whileTap={{ scale: 0.98 }}
      className={`group bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/40 dark:border-white/10 shadow-xl flex flex-col justify-between cursor-pointer ${isLarge ? 'md:col-span-2 md:row-span-1' : 'col-span-1'} hover:shadow-2xl transition-all duration-500`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-10">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-white dark:border-white/10 shadow-xl group-hover:rotate-6 transition-transform">
            <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Session</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">GHS {artisan.price}</p>
          </div>
        </div>
        <div className="flex-1" onClick={() => navigate(`/artisan/${artisan._id}`)}>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.8] mb-2 uppercase italic">{artisan.username}</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: themeColor }}>{artisan.category}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6 line-clamp-3 font-medium italic leading-relaxed">{artisan.bio || "Verified professional elite artisan."}</p>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/messages/${artisan._id}`); }}
            className="text-[9px] font-black uppercase text-blue-600 tracking-[0.2em] hover:underline"
          >
            Ask Question
          </button>
          <div 
            onClick={() => navigate(`/artisan/${artisan._id}`)}
            className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white text-lg shadow-2xl transition-all duration-700 group-hover:bg-black group-hover:rotate-45" 
            style={{ backgroundColor: themeColor }}
          >→</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;