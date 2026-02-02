import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

const ArtisanDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isAddingSkill, setIsAddingSkill] = useState(false); // For Skill Management

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://hireme-bk0l.onrender.com/api';
        
        const res = await axios.get(`${API_BASE}/jobs/artisan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data);

        // Prepare Chart Data from Jobs
        const grouped = res.data.reduce((acc, job) => {
          const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + job.amount;
          return acc;
        }, {});

        const formattedData = Object.keys(grouped).map(date => ({ date, amount: grouped[date] }));
        setChartData(formattedData);
      } catch (err) {
        toast.error("Sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchArtisanData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-blue-600 tracking-tighter animate-pulse">Syncing Command Center...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* --- TOP ROW: PROFILE & STATS --- */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Welcome, {user.username}</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] mt-2">Verified {user.category} Profile</p>
            </div>
            <div className="flex gap-4">
               <motion.button 
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setIsAddingSkill(true)}
                 className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
               >
                 + Add New Skill
               </motion.button>
            </div>
          </div>

          {/* --- REVENUE INSIGHTS CHART --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-100/30 border border-white mb-12">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Revenue Flow</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Earnings visualization</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Payout</p>
                <p className="text-3xl font-black text-blue-600">GHS {chartData.reduce((a, b) => a + b.amount, 0)}</p>
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* --- JOB MANAGEMENT LIST --- */}
          <div className="grid grid-cols-1 gap-6">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-4">Active Engagements</h3>
            <AnimatePresence>
              {jobs.length > 0 ? jobs.map((job) => (
                <JobTicket key={job._id} job={job} />
              )) : (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marketplace is quiet... for now.</p>
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
    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all"
  >
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
        {job.client?.username?.[0] || 'C'}
      </div>
      <div>
        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{job.description}</h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          {job.client?.username} • {job.date}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="text-right">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Fee</p>
        <p className="text-xl font-black text-green-600">GHS {job.amount}</p>
      </div>
      <button className="bg-blue-600 hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-100">
        Mark Done
      </button>
    </div>
  </motion.div>
);

export default ArtisanDashboard;