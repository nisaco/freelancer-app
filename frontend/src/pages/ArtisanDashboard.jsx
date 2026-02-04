import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const ArtisanDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
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
      const res = await axios.get(`${API_BASE}/jobs/my-jobs`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const artisanJobs = res.data;
      setJobs(artisanJobs);

      // Group revenue for chart
      const grouped = artisanJobs.reduce((acc, job) => {
        if (job.status === 'completed') {
          const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + (job.amount || 0);
        }
        return acc;
      }, {});
      setChartData(Object.keys(grouped).map(date => ({ date, amount: grouped[date] })));
    } catch (err) { 
      console.error(err);
      toast.error("Dashboard sync failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFinishJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      // Status changes to awaiting_confirmation so client can release funds
      await axios.put(`${API_BASE}/jobs/${jobId}`, { status: 'awaiting_confirmation' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info("Completion request sent to client");
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: 'awaiting_confirmation' } : j));
    } catch (err) {
      toast.error("Update failed");
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
          
          {/* HEADER */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Artisan Cockpit</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-3 italic">Business Intelligence</p>
            </div>
            
            <motion.button 
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(true)}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-50 text-gray-400 hover:text-blue-600 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </motion.button>
          </div>

          {/* FINANCIAL HUB */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Available Balance</p>
              <h3 className="text-4xl font-black tracking-tighter">GHS {user.walletBalance || 0}</h3>
              <button className="mt-4 text-[9px] font-black uppercase bg-blue-600 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all">Withdraw</button>
              <div className="absolute -right-4 -bottom-4 opacity-10 w-24 h-24 bg-white rounded-full"></div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">In Escrow</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                GHS {jobs.filter(j => j.status === 'paid' || j.status === 'awaiting_confirmation').reduce((a, b) => a + (b.amount || 0), 0)}
              </h3>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col justify-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Reputation</p>
              <div className="flex items-center gap-2">
                 <span className="text-3xl font-black text-gray-900">{user.rating || "5.0"}</span>
                 <div className="flex text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          {/* REVENUE CHART */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-50 mb-12">
              <h3 className="text-xl font-black text-gray-900 uppercase italic mb-8">Performance Analytics</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Tooltip contentStyle={{borderRadius: '20px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}} />
                    <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#colorAmt)" strokeWidth={4} />
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* ENGAGEMENTS */}
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-8">Live Engagements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {jobs.length > 0 ? jobs.map(job => (
                <motion.div 
                  layout key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-tight line-clamp-1">{job.description || "Service Request"}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Client: {job.client?.username || 'Guest'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${job.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {job.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">GHS {job.amount || job.price}</p>
                    {job.status === 'paid' && (
                      <button 
                        onClick={() => handleFinishJob(job._id)}
                        className="px-6 py-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                      >
                        Mark Finished
                      </button>
                    )}
                    {job.status === 'awaiting_confirmation' && (
                      <span className="text-[9px] font-black text-blue-600 animate-pulse italic">Awaiting Client Confirmation...</span>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No Active Engagements</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SETTINGS DRAWER */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsDrawer user={user} setUser={setUser} onClose={() => setIsSettingsOpen(false)} API_BASE={API_BASE} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const SettingsDrawer = ({ user, setUser, onClose, API_BASE }) => {
  const [editData, setEditData] = useState({
    phone: user.phone || '',
    bio: user.bio || '',
    price: user.price || 0,
    location: user.location || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/users/profile-setup`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...user, ...editData };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      toast.success("Profile Synchronized");
      onClose();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] p-12 shadow-2xl overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Business Info</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-black text-2xl">×</button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Phone Number</label>
            <input type="text" value={editData.phone} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Hourly Rate (GHS)</label>
            <input type="number" value={editData.price} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" onChange={(e) => setEditData({...editData, price: e.target.value})} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Location</label>
            <input type="text" value={editData.location} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" onChange={(e) => setEditData({...editData, location: e.target.value})} />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Bio</label>
            <textarea value={editData.bio} className="w-full p-4 bg-gray-50 rounded-2xl font-medium h-32" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Update Identity</button>
        </form>
      </motion.div>
    </>
  );
};

export default ArtisanDashboard;