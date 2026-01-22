import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition'; // Import transition
import { motion, AnimatePresence } from 'framer-motion'; // For deep animations
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ArtisanDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get(`${API_BASE}/artisan/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userRes.data);
        localStorage.setItem('user', JSON.stringify(userRes.data));

        const jobsRes = await axios.get(`${API_BASE}/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(jobsRes.data.filter(job => job.artisan._id === userRes.data._id));
      } catch (err) {
        toast.error("Dashboard failed to sync");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  if (loading) return (
  <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center"
    >
      {/* The Text Animation */}
      <motion.h1 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="text-4xl font-black tracking-tighter text-gray-900"
      >
        HIRE<span className="text-blue-600">ME</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.h1>
      
      {/* Subtle Progress Bar Underneath */}
      <motion.div 
        className="w-24 h-1 bg-gray-100 mt-4 rounded-full overflow-hidden"
      >
        <motion.div 
          animate={{ x: [-100, 100] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-blue-600"
        />
      </motion.div>
      
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-6">
        Syncing your workspace
      </p>
    </motion.div>
  </div>
);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-hidden">
      <Navbar />
      
      <PageTransition>
        <div className="max-w-7xl mx-auto px-6 pt-12">
          
          {/* --- TOP WELCOME HEADER --- */}
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Artisan <span className="text-blue-600">Portal</span>
              </h1>
              <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">
                {currentUser?.isVerified ? "🛡️ Official Verified Business" : "⏳ Verification Pending"}
              </p>
            </motion.div>
            <div className="flex gap-3">
               <Link to="/profile-setup" className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 transition shadow-sm">EDIT PROFILE</Link>
            </div>
          </header>

          {!currentUser?.category ? (
            /* --- HIGH-END SKELETON SETUP PROMPT --- */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] p-16 border border-blue-100 text-center shadow-2xl shadow-blue-100"
            >
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-none">Complete your business.</h2>
              <p className="text-gray-500 mb-10 text-lg max-w-lg mx-auto leading-relaxed">Your professional profile is the key to winning clients. Set your rates and category now.</p>
              <Link to="/profile-setup" className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all hover:px-16 shadow-xl shadow-blue-200 inline-block">
                Start Setup
              </Link>
            </motion.div>
          ) : (
            /* --- MAIN DASHBOARD GRID --- */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                  { label: 'Profession', val: currentUser.category, color: 'bg-blue-600 text-white' },
                  { label: 'Hourly Rate', val: `GHS ${currentUser.price}`, color: 'bg-white text-gray-900' },
                  { label: 'Total Requests', val: bookings.length, color: 'bg-white text-gray-900' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -8 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${stat.color} p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between h-48`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
                    <h3 className="text-4xl font-black tracking-tighter">{stat.val}</h3>
                  </motion.div>
                ))}
              </div>

              {/* --- BOOKINGS LIST --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase italic">Recent Job Requests</h3>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {bookings.map((job, i) => (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 10 }}
                          className="bg-white p-6 rounded-[2rem] border border-gray-100 flex justify-between items-center shadow-sm group hover:border-blue-500 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {job.client?.username.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-lg text-gray-900 leading-none mb-1">{job.client?.username}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(job.date).toDateString()}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {job.status}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {bookings.length === 0 && (
                      <div className="p-10 border-2 border-dashed border-gray-200 rounded-[2rem] text-center text-gray-400 font-bold">
                        No active jobs found
                      </div>
                    )}
                  </div>
                </div>

                {/* --- BIO & PROFILE SIDEBAR --- */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm self-start"
                >
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-6">Business Profile</h4>
                  <p className="text-xl text-gray-700 font-medium leading-relaxed italic">"{currentUser.bio}"</p>
                  <div className="mt-8 pt-8 border-t border-gray-50 flex gap-4">
                    <div className="px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase">{currentUser.location}</div>
                    <div className="px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase">Active</div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default ArtisanDashboard;