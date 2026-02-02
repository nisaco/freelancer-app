import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const ArtisanDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ earnings: 0, completed: 0 });

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
        
        // Fetch Jobs assigned to this artisan
        const res = await axios.get(`${API_BASE}/jobs/artisan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data);
        
        // Calculate simple stats
        const total = res.data.filter(j => j.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
        setStats({ earnings: total, completed: res.data.filter(j => j.status === 'completed').length });
      } catch (err) {
        toast.error("Failed to sync dashboard");
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
          transition={{ duration: 2, repeat: Infinity }}
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
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-12">
          
          {/* Header Stats - Sophisticated Glass Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
              <h2 className="text-4xl font-black text-gray-900">GHS {stats.earnings.toLocaleString()}</h2>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Active Jobs</p>
              <h2 className="text-4xl font-black">{jobs.filter(j => j.status === 'paid').length}</h2>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rating</p>
              <h2 className="text-4xl font-black text-gray-900">5.0 <span className="text-sm text-yellow-400">★★★★★</span></h2>
            </motion.div>
          </div>

          {/* Job Management Section */}
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 italic">Incoming Requests</h3>
          <div className="space-y-6">
            <AnimatePresence>
              {jobs.length > 0 ? jobs.map((job) => (
                <JobTicket key={job._id} job={job} />
              )) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">No active requests yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const JobTicket = ({ job }) => (
  <motion.div 
    layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6"
  >
    <div className="flex items-center gap-6 w-full md:w-auto">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
        {job.client?.username?.[0] || 'C'}
      </div>
      <div>
        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{job.description}</h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 italic">
          Client: {job.client?.username} • Date: {job.date}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
      <div className="text-right">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Payout</p>
        <p className="text-xl font-black text-green-600">GHS {job.amount}</p>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
        Complete
      </motion.button>
    </div>
  </motion.div>
);

export default ArtisanDashboard;