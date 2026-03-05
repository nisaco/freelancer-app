import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

const StarRating = ({ value = 0, size = 'w-3.5 h-3.5' }) => {
  const rounded = Math.round(Number(value || 0));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          className={`${size} ${idx < rounded ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.089 3.35a1 1 0 00.95.69h3.522c.969 0 1.371 1.24.588 1.81l-2.85 2.07a1 1 0 00-.363 1.118l1.089 3.35c.3.921-.755 1.688-1.538 1.118l-2.85-2.07a1 1 0 00-1.176 0l-2.85 2.07c-.783.57-1.838-.197-1.539-1.118l1.09-3.35a1 1 0 00-.364-1.118l-2.85-2.07c-.783-.57-.38-1.81.588-1.81H6.01a1 1 0 00.951-.69l1.088-3.35z" />
        </svg>
      ))}
    </div>
  );
};

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
              <svg className={`w-9 h-9 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.089 3.35a1 1 0 00.95.69h3.522c.969 0 1.371 1.24.588 1.81l-2.85 2.07a1 1 0 00-.363 1.118l1.089 3.35c.3.921-.755 1.688-1.538 1.118l-2.85-2.07a1 1 0 00-1.176 0l-2.85 2.07c-.783.57-1.838-.197-1.539-1.118l1.09-3.35a1 1 0 00-.364-1.118l-2.85-2.07c-.783-.57-.38-1.81.588-1.81H6.01a1 1 0 00.951-.69l1.088-3.35z" />
              </svg>
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

const DisputeModal = ({ isOpen, onClose, onSubmit, job }) => {
  const [reason, setReason] = useState("Service quality issue");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("Service quality issue");
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 backdrop-blur-lg p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 border border-white/20 shadow-2xl"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Raise Dispute
        </h2>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">
          Job: {job.description || "Service Request"}
        </p>
        <div className="mt-6 space-y-4">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 dark:text-white font-semibold"
          >
            <option>Service quality issue</option>
            <option>No-show by artisan</option>
            <option>Overcharge/amount dispute</option>
            <option>Safety concern</option>
            <option>Other</option>
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell admin what happened and what resolution you want."
            className="w-full h-32 p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 dark:text-white font-medium"
          />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500">
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ reason, description })}
              className="flex-[2] py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Submit Ticket
            </button>
          </div>
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
        : '/api';

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
      toast.error(err.response?.data?.message || "Booking failed.");
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
        <button onClick={onClose} className="absolute top-6 right-8 text-3xl font-light text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white z-50 transition-colors">X</button>
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
  const [myDisputes, setMyDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [view, setView] = useState("Marketplace"); // 'Marketplace' | 'Post Project' | 'My Bookings'
  const [filter, setFilter] = useState("All");
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [reviewingJob, setReviewingJob] = useState(null); 
  const [disputeJob, setDisputeJob] = useState(null);
  const [activeTheme, setActiveTheme] = useState({ name: 'All', color: '#2563EB', glow: 'rgba(37, 99, 235, 0.15)' });

  // NEW: BIDDING STATE
  const [postForm, setPostForm] = useState({ serviceType: '', budget: '', date: '', description: '' });
  const [posting, setPosting] = useState(false);
  const [viewBidsJob, setViewBidsJob] = useState(null);
  const [jobBids, setJobBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

  const categories = [
    { name: 'All', icon: 'ALL', color: '#2563EB' },
    { name: 'Electrician', icon: 'EL', color: '#EAB308' },
    { name: 'Plumber', icon: 'PL', color: '#0EA5E9' },
    { name: 'Carpenter', icon: 'CP', color: '#78716C' },
    { name: 'Painter', icon: 'PT', color: '#EC4899' },
    { name: 'Mason', icon: 'MS', color: '#F87171' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(locationFilter);
    }, 350);
    return () => clearTimeout(timer);
  }, [locationFilter]);

  const fetchData = async (locationValue = "") => {
    try {
      const token = localStorage.getItem('token');
      const params = locationValue ? { location: locationValue } : undefined;
      const [artRes, jobRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs/available`, { params }),
        axios.get(`${API_BASE}/jobs/client`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setArtisans(artRes.data);
      setMyJobs(jobRes.data);
      if (token) {
        const disputeRes = await axios.get(`${API_BASE}/disputes/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyDisputes(disputeRes.data || []);
      }
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
      await axios.put(`${API_BASE}/jobs/${reviewingJob._id}/confirm`, {
        rating: Number(rating),
        reviewComment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Funds Released!");
      setReviewingJob(null); 
      fetchData(); 
    } catch (err) { toast.error("Release failed."); }
  };

  const handleDownloadInvoice = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/jobs/${jobId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Invoice download failed");
    }
  };

  const handleCreateDispute = async ({ reason, description }) => {
    if (!disputeJob?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/disputes`, {
        jobId: disputeJob._id,
        reason,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Dispute ticket submitted to admin");
      setDisputeJob(null);
      fetchData(locationFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit dispute");
    }
  };

  // --- NEW: BIDDING METHODS ---
  const handlePostProject = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/jobs/open`, postForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Project posted successfully! Artisans can now bid.");
      setPostForm({ serviceType: '', budget: '', date: '', description: '' });
      setView('My Bookings');
      fetchData();
    } catch (err) {
      toast.error("Failed to post project.");
    } finally {
      setPosting(false);
    }
  };

  const handleViewBids = async (job) => {
    setViewBidsJob(job);
    setLoadingBids(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/jobs/${job._id}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobBids(res.data);
    } catch (err) {
      toast.error("Failed to load bids.");
    } finally {
      setLoadingBids(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/jobs/${viewBidsJob._id}/accept-bid/${bidId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setViewBidsJob(null);
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept bid.");
    }
  };

  const handleFundEscrow = (jobId) => {
    toast.info("Redirecting to Payment Gateway to fund Escrow...");
    // Future integration: navigate(`/payment/checkout/${jobId}`);
  };

  const filteredArtisans = artisans.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.username.toLowerCase().includes(term) ||
      (a.category && a.category.toLowerCase().includes(term)) ||
      (a.location && a.location.toLowerCase().includes(term));
    const matchesCategory = filter === "All" || a.category === filter;
    const matchesLocation = !locationFilter || (a.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesCategory && matchesLocation;
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
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-2xl flex gap-1 overflow-x-auto max-w-full custom-scrollbar">
              {["Marketplace", "Post Project", "My Bookings"].map(v => {
                const isSelected = view === v;
                return (
                  <button key={v} onClick={() => setView(v)} 
                    className={`px-6 md:px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                    {v}
                  </button>
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* VIEW 1: MARKETPLACE */}
            {view === "Marketplace" && (
              <motion.div key="market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                
                <div className="max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-2 flex items-center border border-white/40 dark:border-white/10 transition-all focus-within:border-blue-500/50 min-w-0">
                    <div className="pl-6 text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    <input type="text" placeholder="Search for professionals..." className="w-full px-5 py-5 outline-none font-bold text-gray-700 dark:text-white bg-transparent placeholder:text-gray-300" onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-2 flex items-center border border-white/40 dark:border-white/10 transition-all focus-within:border-blue-500/50 min-w-0">
                    <div className="pl-6 text-gray-400">LOC</div>
                    <input
                      type="text"
                      value={locationFilter}
                      placeholder="Near me: East Legon, Kumasi, Takoradi..."
                      className="w-full px-5 py-5 outline-none font-bold text-gray-700 dark:text-white bg-transparent placeholder:text-gray-300"
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full flex justify-start md:justify-center mb-20 overflow-x-auto no-scrollbar px-2">
                  <div className="bg-white/30 dark:bg-black/20 p-2 rounded-full border border-white/20 flex gap-2 shadow-2xl backdrop-blur-md w-max min-w-full md:min-w-0 md:w-auto">
                    {categories.map((cat) => (
                      <button key={cat.name} onClick={() => { setFilter(cat.name); setActiveTheme({ name: cat.name, color: cat.color, glow: `${cat.color}22` }); }}
                        className={`relative z-10 px-5 md:px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] flex-shrink-0 transition-all whitespace-nowrap ${filter === cat.name ? 'text-white' : 'text-gray-400'}`}>
                        <span className="mr-2">{cat.icon}</span> {cat.name}
                        {filter === cat.name && <motion.div layoutId="pill" className="absolute inset-0 -z-10 rounded-full shadow-lg" style={{ backgroundColor: cat.color }} />}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-20 w-full min-w-0">
                  {filteredArtisans.map((artisan, i) => (
                    <ArtisanCard key={artisan._id} artisan={artisan} index={i} themeColor={activeTheme.color} onBook={() => setSelectedArtisan(artisan)} />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* VIEW 2: POST PROJECT */}
            {view === "Post Project" && (
              <motion.div key="post_project" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto pb-20">
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-black uppercase italic text-gray-900 dark:text-white mb-2">Post an <span className="text-blue-600">Open Job</span></h2>
                  <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-widest">Let verified artisans bid on your project.</p>
                  
                  <form onSubmit={handlePostProject} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Service Required</label>
                      <select required value={postForm.serviceType} onChange={e => setPostForm({...postForm, serviceType: e.target.value})} className="w-full p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 shadow-sm">
                        <option value="">Select Service...</option>
                        <option value="Plumber">Plumbing</option>
                        <option value="Electrician">Electrical</option>
                        <option value="Carpenter">Carpentry</option>
                        <option value="Mason">Masonry</option>
                        <option value="Painter">Painting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Estimated Budget (GHS)</label>
                        <input type="number" required placeholder="e.g. 500" value={postForm.budget} onChange={e => setPostForm({...postForm, budget: e.target.value})} className="w-full p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Target Date</label>
                        <input type="date" required value={postForm.date} onChange={e => setPostForm({...postForm, date: e.target.value})} className="w-full p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Project Details</label>
                      <textarea required placeholder="Describe exactly what you need done..." value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} className="w-full p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 shadow-sm h-32 resize-none" />
                    </div>

                    <button type="submit" disabled={posting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 mt-4">
                      {posting ? 'Publishing...' : 'Publish Job to Market'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: MY BOOKINGS / JOBS */}
            {view === "My Bookings" && (
              <motion.div key="jobs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20 w-full min-w-0">
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-12 italic text-gray-900 dark:text-white">Active <span className="text-blue-600">Bookings</span></h2>
                {myJobs.length > 0 ? myJobs.map(job => (
                  <div key={job._id} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group hover:shadow-2xl transition-all duration-500 w-full min-w-0">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0 w-full md:w-auto">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.4rem] md:rounded-[2rem] bg-gray-50 dark:bg-gray-800 overflow-hidden border-2 border-white dark:border-white/10 shadow-lg shrink-0 flex items-center justify-center text-3xl">
                        {job.artisan ? (
                          <img src={job.artisan.profilePic || `https://ui-avatars.com/api/?name=${job.artisan.username}`} className="w-full h-full object-cover" />
                        ) : (
                          "🔨"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter truncate">
                          {job.artisan ? job.artisan.username : 'Open Project'}
                        </h4>
                        <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                           {job.artisan && <button onClick={() => navigate(`/messages/${job.artisan?._id}`)} className="text-[8px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg">Message</button>}
                           <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] self-center">GHS {job.amount || job.budget || job.price}</p>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] self-center">{job.serviceType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full ${
                          job.status === 'open' ? 'bg-purple-100 text-purple-700' :
                          job.status === 'awaiting_confirmation' ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-500/30' : 
                          'bg-gray-100 dark:bg-white/10 text-gray-400'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </p>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          {job.status === 'open' && (
                            <button onClick={() => handleViewBids(job)} className="flex-1 md:flex-none bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Review Bids</button>
                          )}
                          {job.status === 'pending_payment' && (
                            <button onClick={() => handleFundEscrow(job._id)} className="flex-1 md:flex-none bg-orange-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all">Fund Escrow</button>
                          )}
                          {job.status === 'awaiting_confirmation' && (
                            <motion.button 
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setReviewingJob(job)} 
                              className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-green-500/30 hover:bg-black transition-all"
                            >
                              Release Funds
                            </motion.button>
                          )}
                          {job.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadInvoice(job._id)}
                              className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                            >
                              Invoice PDF
                            </button>
                          )}
                          {job.status !== 'completed' && job.status !== 'open' && job.status !== 'pending_payment' && (
                            <button
                              onClick={() => setDisputeJob(job)}
                              className="flex-1 md:flex-none bg-red-100 text-red-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-200 hover:bg-red-200 transition-all"
                            >
                              Raise Dispute
                            </button>
                          )}
                        </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-24 bg-white/20 dark:bg-black/10 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/20">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.5em]">No bookings found</p>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-5 text-gray-900 dark:text-white">
                    My <span className="text-blue-600">Disputes</span>
                  </h3>
                  <div className="space-y-3">
                    {myDisputes.length > 0 ? myDisputes.slice(0, 6).map((d) => (
                      <div key={d._id} className="bg-white/30 dark:bg-white/5 border border-white/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight">{d.ticketId}</p>
                          <p className="text-[10px] text-gray-500 font-semibold truncate">{d.reason}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                          d.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </div>
                    )) : (
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No dispute tickets yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL SECTION */}
        <AnimatePresence>
          {/* VIEW BIDS MODAL (NEW) */}
          {viewBidsJob && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-[#151a25] w-full max-w-3xl rounded-[3rem] p-8 md:p-10 shadow-2xl max-h-[90vh] flex flex-col border border-white/10">
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-white/10">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Project <span className="text-blue-600">Proposals</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{viewBidsJob.serviceType}</p>
                  </div>
                  <button onClick={() => setViewBidsJob(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl font-light">×</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {loadingBids ? (
                    <p className="text-center text-gray-400 py-10 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Bids...</p>
                  ) : jobBids.length > 0 ? (
                    jobBids.map(bid => (
                      <div key={bid._id} className="bg-gray-50 dark:bg-black/20 p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={bid.artisan?.profilePic || `https://ui-avatars.com/api/?name=${bid.artisan?.username}`} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{bid.artisan?.username}</h4>
                              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                <span className="text-yellow-500">★ {bid.artisan?.rating?.toFixed(1) || 0}</span>
                                <span>•</span>
                                <span>{bid.artisan?.reviewCount || 0} Jobs</span>
                                {bid.artisan?.isVerified && <span className="text-green-500 bg-green-100 px-2 py-0.5 rounded-full ml-1">Verified</span>}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-white dark:bg-white/5 p-4 rounded-2xl">"{bid.coverLetter}"</p>
                        </div>
                        <div className="w-full md:w-auto flex flex-col gap-3 shrink-0 bg-white dark:bg-white/5 p-5 rounded-[1.5rem] text-center border border-gray-100 dark:border-white/5 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bid Amount</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">GHS {bid.amount}</p>
                          <button 
                            onClick={() => handleAcceptBid(bid._id)}
                            className="w-full mt-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-colors"
                          >
                            Accept Bid
                          </button>
                          <button 
                            onClick={() => navigate(`/artisan/${bid.artisan?._id}`)}
                            className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline mt-1"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-500 font-bold text-sm">No proposals received yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* EXISTING MODALS */}
          {selectedArtisan && <BookingModal artisan={selectedArtisan} themeColor={activeTheme.color} onClose={() => setSelectedArtisan(null)} />}
          {reviewingJob && (
            <ReviewModal 
              isOpen={!!reviewingJob} 
              artisanName={reviewingJob.artisan?.username} 
              onClose={() => setReviewingJob(null)} 
              onConfirm={handleConfirmCompletion} 
            />
          )}
          {disputeJob && (
            <DisputeModal
              isOpen={!!disputeJob}
              job={disputeJob}
              onClose={() => setDisputeJob(null)}
              onSubmit={handleCreateDispute}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const ArtisanCard = ({ artisan, index, themeColor, onBook }) => {
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
            {artisan.isGoldPro && (
              <p className="text-[8px] font-black text-yellow-600 uppercase tracking-[0.3em] mb-1">Gold Pro</p>
            )}
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Session</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">GHS {artisan.price}</p>
          </div>
        </div>
        <div className="flex-1" onClick={() => navigate(`/artisan/${artisan._id}`)}>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.8] mb-2 uppercase italic">{artisan.username}</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: themeColor }}>{artisan.category}</p>
          <div className="mt-3 flex items-center gap-2">
            <StarRating value={artisan.rating} />
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {Number(artisan.rating || 0).toFixed(1)} ({artisan.reviewCount || 0})
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6 line-clamp-3 font-medium italic leading-relaxed">{artisan.bio || "Verified professional elite artisan."}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 font-semibold">
            {artisan.workExperience
              || (artisan.educationInstitution
                ? `${artisan.educationInstitution}${artisan.educationStatus ? ` (${artisan.educationStatus})` : ''}`
                : artisan.educationBackground)
              || 'No additional profile details yet.'}
          </p>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/messages/${artisan._id}`); }}
            className="text-[9px] font-black uppercase text-blue-600 tracking-[0.2em] hover:underline"
          >
            Ask Question
          </button>
          <div 
            onClick={(e) => { e.stopPropagation(); onBook(); }}
            className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white text-lg shadow-2xl transition-all duration-700 group-hover:bg-black group-hover:rotate-45" 
            style={{ backgroundColor: themeColor }}
          >-&gt;</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;