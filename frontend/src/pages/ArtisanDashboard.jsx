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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chartData, setChartData] = useState([]);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/jobs/artisan`, { headers: { Authorization: `Bearer ${token}` } });
        setJobs(res.data);
        
        // Prepare Chart Data
        const grouped = res.data.reduce((acc, job) => {
          if (job.status === 'completed') {
            const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + job.amount;
          }
          return acc;
        }, {});
        setChartData(Object.keys(grouped).map(date => ({ date, amount: grouped[date] })));
      } catch (err) { toast.error("Sync error"); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, [user]);

  const handleFinishJob = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/jobs/${id}/finish`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(res.data.message);
      window.location.reload(); // Refresh to sync wallet balances
    } catch (err) { toast.error("Failed to finish job"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-blue-600 animate-pulse">Opening Cockpit...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-12">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Cockpit</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2 italic">Earned GHS {user.walletBalance?.toFixed(2)} total</p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSettingsOpen(true)} className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </motion.button>
          </div>

          {/* WALLET SYSTEM UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Available Balance</p>
              <h2 className="text-5xl font-black tracking-tighter mb-8">GHS {user.walletBalance?.toFixed(2)}</h2>
              {user.isVerified ? (
                <button className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Withdraw to MoMo</button>
              ) : (
                <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Verify ID to enable withdrawals</p>
                </div>
              )}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Escrow (Pending)</p>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">GHS {user.pendingBalance?.toFixed(2)}</h2>
              <p className="text-[9px] text-gray-400 mt-4 italic">Released automatically upon job completion.</p>
            </div>
          </div>

          {/* REVENUE CHART */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white mb-12">
            <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6">Revenue Growth</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Tooltip contentStyle={{borderRadius:'20px', border:'none'}} />
                  <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#dbeafe" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* JOB CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{job.description}</h4>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${job.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{job.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">GHS {job.amount}</p>
                  {job.status === 'paid' && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleFinishJob(job._id)} className="px-6 py-3 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all">Mark Finished</motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isSettingsOpen && <SettingsDrawer user={user} setUser={setUser} onClose={() => setIsSettingsOpen(false)} API_BASE={API_BASE} />}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

// SETTINGS DRAWER
const SettingsDrawer = ({ user, setUser, onClose, API_BASE }) => {
  const [editData, setEditData] = useState({ 
    phone: user.phone || '', bio: user.bio || '', price: user.price || 0, 
    location: user.location || '', momoNumber: user.momoNumber || '', momoNetwork: user.momoNetwork || '' 
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/artisan/update-profile`, editData, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Identity Synced");
      onClose();
    } catch (err) { toast.error("Sync failed"); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] p-10 flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black uppercase tracking-tighter">Settings</h2><button onClick={onClose} className="text-4xl font-light text-gray-300 hover:text-black">×</button></div>
        <form onSubmit={handleUpdate} className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
          <input type="text" placeholder="MoMo Number" value={editData.momoNumber} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, momoNumber: e.target.value})} />
          <select value={editData.momoNetwork} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, momoNetwork: e.target.value})}>
            <option value="">Select Network</option>
            <option value="MTN">MTN</option>
            <option value="Telecel">Telecel</option>
            <option value="AirtelTigo">AirtelTigo</option>
          </select>
          <input type="text" placeholder="Location" value={editData.location} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, location: e.target.value})} />
          <textarea placeholder="Professional Bio" value={editData.bio} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 h-32" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
          <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Save & Sync</button>
        </form>
      </motion.div>
    </>
  );
};

export default ArtisanDashboard;