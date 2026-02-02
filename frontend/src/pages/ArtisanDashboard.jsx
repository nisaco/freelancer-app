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
  const [chartData, setChartData] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Toggle for the drawer

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
        const res = await axios.get(`${API_BASE}/jobs/artisan`, { headers: { Authorization: `Bearer ${token}` } });
        setJobs(res.data);

        const grouped = res.data.reduce((acc, job) => {
          const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + job.amount;
          return acc;
        }, {});
        setChartData(Object.keys(grouped).map(date => ({ date, amount: grouped[date] })));
      } catch (err) { toast.error("Sync failed"); }
      finally { setLoading(false); }
    };
    fetchArtisanData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-blue-600 animate-pulse">Loading Cockpit...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* --- DASHBOARD HEADER --- */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Artisan Cockpit</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">Manage your business & growth</p>
            </div>
            
            {/* SETTINGS TRIGGER BUTTON */}
            <motion.button 
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 text-gray-400 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>

          {/* --- METRICS / CHART --- */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white mb-10">
             <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6">Earnings Overview</h3>
             <div className="h-[250px] w-full">
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

          {/* --- ACTIVE JOBS LIST --- */}
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6">Recent Bookings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{job.description}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{job.client?.username} • {job.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-green-600 tracking-tighter">GHS {job.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SETTINGS SIDE DRAWER --- */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsDrawer 
              user={user} 
              setUser={setUser} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

// --- SETTINGS DRAWER COMPONENT ---
const SettingsDrawer = ({ user, setUser, onClose }) => {
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
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
      const res = await axios.put(`${API_BASE}/artisan/update-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Profile Updated!");
      onClose();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl p-10 flex flex-col"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Profile Settings</h2>
          <button onClick={onClose} className="text-4xl font-light text-gray-300 hover:text-black">×</button>
        </div>

        <form onSubmit={handleUpdate} className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-10">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">WhatsApp Number</label>
            <input type="text" value={editData.phone} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Base Rate (GHS)</label>
            <input type="number" value={editData.price} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, price: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Your Location</label>
            <input type="text" value={editData.location} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, location: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Business Bio</label>
            <textarea value={editData.bio} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 h-32" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95">
            Save All Changes
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default ArtisanDashboard;