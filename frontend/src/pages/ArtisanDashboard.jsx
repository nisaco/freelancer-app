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
  
  // ALIGNED WITH YOUR USER.JS SCHEMA
  const [editData, setEditData] = useState({
    phone: user.phone || '',
    bio: user.bio || '',
    price: user.price || 0,
    location: user.location || '',
    profilePic: user.profilePic || ''
  });

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
      
      const res = await axios.put(`${API_BASE}/artisan/update-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Profile fully synced!");
    } catch (err) { toast.error("Update failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-blue-600 animate-pulse tracking-widest">Updating Cockpit...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-12">
          
          {/* --- PROFILE SETTINGS (ALIGNED TO USER.JS) --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-100 border border-white mb-12">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-blue-50 shadow-lg bg-gray-100">
                  <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <p className={`text-[9px] font-black uppercase tracking-widest ${user.isVerified ? 'text-green-500' : 'text-blue-600'}`}>
                  {user.isVerified ? '✓ Verified Pro' : 'Pending Verification'}
                </p>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">WhatsApp (phone)</label>
                  <input type="text" value={editData.phone} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Location</label>
                  <input type="text" value={editData.location} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, location: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Rate (price)</label>
                  <input type="number" value={editData.price} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Professional Bio</label>
                  <textarea value={editData.bio} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 h-20" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl self-start">Update Business Profile</button>
              </form>
            </div>
          </motion.div>

          {/* ... Revenue chart and jobs list follow exactly as before ... */}
        </div>
      </div>
    </PageTransition>
  );
};

export default ArtisanDashboard;