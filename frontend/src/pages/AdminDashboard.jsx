import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const AdminDashboard = () => {
  const [data, setData] = useState({ 
    stats: { totalArtisans: 0, totalClients: 0, totalUsers: 0, totalVolume: 0 }, 
    pendingArtisans: [],
    recentTransactions: [] 
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/admin' 
    : 'https://hireme-bk0l.onrender.com/api/admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/verify/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Identity ${status === 'approve' ? 'Verified' : 'Rejected'}`);
      fetchData(); 
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B0F1A]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.5em] text-blue-600">Syncing Command Center</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 relative z-10 w-full"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Admin <span className="text-blue-600">Console</span>
            </h1>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mt-4 italic">Network Governance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Network Volume', value: `GHS ${data.stats.totalVolume || 0}`, color: 'text-blue-600' },
              { label: 'Artisans', value: data.stats.totalArtisans, color: 'text-gray-900 dark:text-white' },
              { label: 'Clients', value: data.stats.totalClients, color: 'text-gray-900 dark:text-white' },
              { label: 'Total Users', value: data.stats.totalUsers, color: 'text-green-500' }
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-2xl">
                <p className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                <h2 className={`text-4xl font-black tracking-tighter italic ${stat.color}`}>{stat.value}</h2>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Verification <span className="text-blue-600">Queue</span></h3>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {data.pendingArtisans.map((artisan) => (
                    <motion.div key={artisan._id} layout variants={itemVariants} exit={{ opacity: 0, x: 20 }} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 shadow-xl flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 border-white"><img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" /></div>
                        <div>
                          <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase italic tracking-tighter">{artisan.username}</h4>
                          <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">{artisan.category}</p>
                          <a href={artisan.ghanaCardImage} target="_blank" rel="noreferrer" className="text-gray-400 text-[8px] font-bold underline mt-1 inline-block uppercase tracking-widest">Verify ID</a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(artisan._id, 'approve')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Approve</button>
                        <button onClick={() => handleVerify(artisan._id, 'reject')} className="bg-white/10 text-red-500 px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-500/20">Reject</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Live <span className="text-blue-600">Feed</span></h3>
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/40 p-8 shadow-2xl h-[500px] overflow-y-auto no-scrollbar">
                <div className="space-y-8">
                  {data.recentTransactions.map((tx, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{tx.clientName} paid {tx.artisanName}</p>
                        <p className="text-[10px] font-black text-blue-600 mt-1 uppercase">GHS {tx.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;