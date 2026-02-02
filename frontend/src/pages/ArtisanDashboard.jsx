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
  
  // ALIGNED WITH YOUR USER.JS SCHEMA
  const [editData, setEditData] = useState({
    phone: user?.phone || '',
    bio: user?.bio || '',
    price: user?.price || 0,
    location: user?.location || '',
    profilePic: user?.profilePic || ''
  });

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000/api' 
          : 'https://hireme-bk0l.onrender.com/api';
        
        const res = await axios.get(`${API_BASE}/jobs/artisan`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setJobs(res.data);

        const grouped = res.data.reduce((acc, job) => {
          const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + job.amount;
          return acc;
        }, {});
        setChartData(Object.keys(grouped).map(date => ({ date, amount: grouped[date] })));
      } catch (err) { 
        toast.error("Dashboard sync failed"); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchArtisanData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // PREVENT 500 ERRORS: Ensure types match User.js
    const payload = {
      phone: String(editData.phone),
      bio: String(editData.bio),
      location: String(editData.location),
      price: editData.price === "" ? 0 : Number(editData.price),
      profilePic: String(editData.profilePic)
    };

    try {
      const token = localStorage.getItem('token');
      const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://hireme-bk0l.onrender.com/api';
      
      const res = await axios.put(`${API_BASE}/artisan/update-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Professional profile updated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server Error (500)");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white font-black uppercase text-blue-600 tracking-widest animate-pulse">
      Syncing Marketplace Status...
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-12">
          
          {/* PROFILE MANAGEMENT SECTION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-100 border border-white mb-12">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-blue-50 shadow-lg bg-gray-100">
                  <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <p className={`text-[9px] font-black uppercase tracking-widest ${user.isVerified ? 'text-green-500' : 'text-blue-500'}`}>
                   {user.isVerified ? '✓ Verified Pro' : 'Verification Pending'}
                </p>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">WhatsApp (phone)</label>
                  <input type="text" value={editData.phone} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Base Rate (price per hr)</label>
                  <input type="number" value={editData.price} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, price: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Business Bio</label>
                  <textarea value={editData.bio} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 h-24 focus:ring-2 focus:ring-blue-100" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all self-start active:scale-95">
                  Update Business Identity
                </button>
              </form>
            </div>
          </motion.div>

          {/* REVENUE INSIGHTS */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-white mb-12">
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h3 className="text-xl font-black text-gray-900 uppercase italic">Revenue Trends</h3>
                 <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Last 30 days activity</p>
               </div>
               <div className="text-right">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Balance</p>
                 <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">GHS {chartData.reduce((a, b) => a + b.amount, 0)}</p>
               </div>
             </div>
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <Tooltip contentStyle={{borderRadius: '20px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}} />
                   <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#dbeafe" strokeWidth={4} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* JOB MANAGEMENT */}
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-8">Active Engagements</h3>
          <div className="space-y-6">
            {jobs.length > 0 ? jobs.map(job => (
              <div key={job._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                    {job.client?.username?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tighter">{job.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Status: {job.status} • Client: {job.client?.username}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Earned</p>
                   <p className="text-xl font-black text-green-600 tracking-tighter">GHS {job.amount}</p>
                </div>
              </div>
            )) : (
              <div className="py-20 bg-gray-50/50 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No jobs yet. Keep your profile updated!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArtisanDashboard;