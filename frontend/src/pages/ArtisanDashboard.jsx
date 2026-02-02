import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const ArtisanDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [chartData, setChartData] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    fetchArtisanData();
  }, []);

  const fetchArtisanData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/jobs/artisan`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setJobs(res.data);

      // Group revenue by date for the chart
      const grouped = res.data.reduce((acc, job) => {
        if (job.status === 'paid' || job.status === 'completed') {
          const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + job.amount;
        }
        return acc;
      }, {});
      setChartData(Object.keys(grouped).map(date => ({ date, amount: grouped[date] })));
    } catch (err) { 
      toast.error("Dashboard sync failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFinishJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/jobs/${jobId}/finish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job marked as finished!");
      // Optimistic UI update
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: 'completed' } : j));
    } catch (err) {
      toast.error("Failed to update job status");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white font-black uppercase text-blue-600 tracking-widest animate-pulse">
      Securing Cockpit Access...
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Artisan Cockpit</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-3">Business Intelligence & Management</p>
            </div>
            
            <motion.button 
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(true)}
              className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-gray-200/50 border border-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>

          {/* REVENUE INSIGHTS */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-100 border border-white mb-12">
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h3 className="text-xl font-black text-gray-900 uppercase italic">Revenue Stream</h3>
                 <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Growth over time</p>
               </div>
               <div className="text-right">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Earned</p>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">GHS {chartData.reduce((a, b) => a + b.amount, 0)}</p>
               </div>
             </div>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <Tooltip contentStyle={{borderRadius: '20px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}} />
                   <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#colorAmt)" strokeWidth={5} />
                   <defs>
                     <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                       <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* JOB MANAGEMENT */}
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900 uppercase italic">Live Engagements</h3>
            <div className="h-[1px] flex-1 bg-gray-100 mx-6 hidden md:block" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Showing {jobs.length} total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {jobs.map(job => (
                <motion.div 
                  layout key={job._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight line-clamp-1">{job.description}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Client: {job.client?.username || 'Guest'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${job.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {job.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">GHS {job.amount}</p>
                    
                    {job.status === 'paid' && (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFinishJob(job._id)}
                        className="px-6 py-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                      >
                        Mark Finished
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* SETTINGS SIDE DRAWER */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsDrawer 
              user={user} 
              setUser={setUser} 
              onClose={() => setIsSettingsOpen(false)} 
              API_BASE={API_BASE}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

// --- SETTINGS DRAWER COMPONENT ---
const SettingsDrawer = ({ user, setUser, onClose, API_BASE }) => {
  const [editData, setEditData] = useState({
    phone: user.phone || '',
    bio: user.bio || '',
    price: user.price || 0,
    location: user.location || '',
    profilePic: user.profilePic || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/artisan/update-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Identity Updated Successfully");
      onClose();
    } catch (err) { 
      toast.error("Update failed. Check your data."); 
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-md z-[150]" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl p-8 md:p-12 flex flex-col"
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-4xl font-light text-gray-300 hover:text-black transition-colors">×</button>
        </div>

        <form onSubmit={handleUpdate} className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-10">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">WhatsApp (phone)</label>
            <input type="text" value={editData.phone} placeholder="233..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Base Price (GHS)</label>
            <input type="number" value={editData.price} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, price: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Your Location</label>
            <input type="text" value={editData.location} placeholder="Accra, Ghana" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, location: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Professional Bio</label>
            <textarea value={editData.bio} placeholder="Describe your expertise..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 h-32 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-100 hover:bg-black transition-all active:scale-95">
            Synchronize Profile
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default ArtisanDashboard;