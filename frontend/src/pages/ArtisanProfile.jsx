import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

// --- VERIFIED BADGE COMPONENT (TikTok/LinkedIn Style) ---
const VerifiedBadge = ({ size = "w-6 h-6" }) => (
  <svg className={`${size} text-blue-500 fill-current shadow-xl inline-block ml-2`} viewBox="0 0 24 24">
    <path d="M23.389 10.134a1.001 1.001 0 0 0-.544-.687l-2.074-.912a1 1 0 0 1-.57-.933l.033-2.264a1 1 0 0 0-.74-.974l-2.203-.51a1 1 0 0 1-.74-.74l-.51-2.203a1 1 0 0 0-.974-.74l-2.264.033a1 1 0 0 1-.933-.57l-.912-2.074a1 1 0 0 0-1.687 0l-.912 2.074a1 1 0 0 1-.933.57l-2.264-.033a1 1 0 0 0-.974.74l-.51 2.203a1 1 0 0 1-.74.74l-2.203.51a1 1 0 0 0-.74.974l.033 2.264a1 1 0 0 1-.57.933l-2.074.912a1 1 0 0 0 0 1.687l2.074.912a1 1 0 0 1 .57.933l-.033 2.264a1 1 0 0 0 .74.974l2.203.51a1 1 0 0 1 .74.74l.51 2.203a1 1 0 0 0 .974.74l2.264-.033a1 1 0 0 1 .933.57l.912 2.074a1 1 0 0 0 1.687 0l.912-2.074a1 1 0 0 1 .933-.57l2.264.033a1 1 0 0 0 .974-.74l.51-2.203a1 1 0 0 1 .74-.74l2.203-.51a1 1 0 0 0 .74-.974l-.033-2.264a1 1 0 0 1 .57-.933l2.074-.912a1.001 1.001 0 0 0 .544-.687zM10.293 17.293l-4-4 1.414-1.414L10.293 14.465l7.293-7.293 1.414 1.414-8.707 8.707z" />
  </svg>
);

// --- SHARED BOOKING MODAL (Your logic preserved) ---
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
        <button onClick={onClose} className="absolute top-6 right-8 text-2xl font-light text-gray-400">×</button>
        <h3 className="text-2xl font-black mb-6 uppercase italic text-gray-900 dark:text-white">Hire {artisan.username}</h3>
        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Preferred Date</label>
            <input type="date" className="w-full mt-2 p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold dark:text-white" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Details</label>
            <textarea placeholder="What do you need help with?" className="w-full mt-2 p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 h-32 font-medium dark:text-white" onChange={(e) => setBookingData({...bookingData, description: e.target.value})} />
          </div>
          <button onClick={handleBooking} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
            {loading ? "INITIALIZING..." : `PAY GHS ${artisan.price}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN PROFILE PAGE ---
const ArtisanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [reviews, setReviews] = useState([]);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/available`);
        const found = res.data.find(a => a._id === id);
        if (found) setArtisan(found);
        else toast.error("Artisan not found");
      } catch (err) { toast.error("Error loading profile"); }
      finally { setLoading(false); }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/reviews/${id}`);
        setReviews(res.data);
      } catch (err) { console.error("Failed to fetch reviews"); }
    };

    fetchArtisan();
    fetchReviews();
  }, [id, API_BASE]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0B0F1A] font-black uppercase text-blue-600 animate-pulse">Scanning Profile...</div>;
  if (!artisan) return <div className="h-screen flex items-center justify-center">Profile Missing</div>;

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>

        <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-24 relative z-10 w-full pb-20">
          {/* HEADER CARD */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-white/40 dark:border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-white/10 shadow-2xl">
              <img src={artisan.profilePic || `https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
                  {artisan.username}
                </h1>
                {artisan.isVerified && <VerifiedBadge size="w-10 h-10" />}
              </div>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{artisan.category}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-2 bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 dark:border-white/10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic mb-6">About the Professional</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed italic font-medium">
                {artisan.bio || `${artisan.username} is a verified elite ${artisan.category} providing premium results.`}
              </p>
            </div>

            <div className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center text-center text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-80">GHS {artisan.price}</p>
              <h4 className="text-3xl font-black italic mb-8 uppercase tracking-tighter">Ready to <br />book?</h4>
              <button onClick={() => setIsModalOpen(true)} className="w-full py-5 bg-white text-blue-600 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">
                Book Now
              </button>
              <button 
                onClick={() => navigate(`/messages/${artisan._id}`)}
                className="w-full py-5 border border-white/20 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all mt-4"
              >
                Ask a Question
              </button>
            </div>
          </div>

          {/* REVIEWS GALLERY */}
          <div className="mt-24">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-10">
              Client <span className="text-blue-600">Testimonials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.length > 0 ? reviews.map((rev) => (
                <motion.div 
                  key={rev._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/40 dark:border-white/10 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black">
                        {rev.client?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">{rev.client?.username}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic font-medium leading-relaxed">
                    "{rev.reviewComment || "The client didn't leave a comment, but the service was excellent!"}"
                  </p>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center bg-white/10 rounded-[3rem] border border-dashed border-white/20">
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">No reviews recorded for this elite pro yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL RENDER */}
        <AnimatePresence>
          {isModalOpen && <BookingModal artisan={artisan} onClose={() => setIsModalOpen(false)} themeColor="#2563EB" />}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default ArtisanProfile;