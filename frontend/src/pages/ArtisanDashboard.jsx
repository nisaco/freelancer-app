import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

// --- ANIMATION VARIANTS (The "Power-Up" Sequence) ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Rhythmic entrance for cards
      delayChildren: 0.3     // Wait for the main page fade to finish
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const getVerificationTimelineState = (artisan) => {
  const hasIdUploaded = Boolean(artisan?.ghanaCardImage || artisan?.ghanaCardNumber);
  const isVerified = Boolean(artisan?.isVerified);
  const isUnderReview = Boolean(artisan?.isPending) || (hasIdUploaded && !isVerified);

  const steps = [
    {
      key: 'uploaded',
      label: 'ID Uploaded',
      description: hasIdUploaded ? 'Documents on file' : 'Upload Ghana Card to start review',
      done: hasIdUploaded,
      active: !hasIdUploaded
    },
    {
      key: 'review',
      label: 'Under Review',
      description: isUnderReview || isVerified ? 'Admin review in progress/completed' : 'Waiting for document upload',
      done: isUnderReview || isVerified,
      active: isUnderReview && !isVerified
    },
    {
      key: 'verified',
      label: 'Verified',
      description: isVerified ? 'Trust badge is active' : 'Pending approval',
      done: isVerified,
      active: isVerified
    }
  ];

  let title = 'Verification not started';
  let note = 'Submit your Ghana Card to begin identity checks.';
  if (isVerified) {
    title = 'Verification complete';
    note = 'Your account is verified. Clients can see your trust badge.';
  } else if (isUnderReview) {
    title = 'Verification in progress';
    note = 'Your documents are under review. You will be notified once approved.';
  }

  return { steps, title, note, hasIdUploaded, isVerified };
};

const ArtisanDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({}); // Start with empty, fetch fresh
  const [chartData, setChartData] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null); // FIXED BUG HERE
  const [uploading, setUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalEarnedThisMonth: 0,
    profileViewsToday: 0,
    successRate: 0
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // --- WALLET/WITHDRAWAL ADDITIONS ---
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [transactions, setTransactions] = useState([]); 

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  useEffect(() => {
    fetchArtisanData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const interval = setInterval(async () => {
      try {
        const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser((prev) => ({ ...prev, ...profileRes.data }));
      } catch (error) {
        // Keep silent here; dashboard already handles primary sync errors.
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [API_BASE]);

  const fetchArtisanData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [jobRes, profileRes, transRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs/my-jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/transactions/my-transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/jobs/artisan/analytics/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const artisanJobs = jobRes.data;
      const freshUser = profileRes.data;

      setJobs(artisanJobs);
      setTransactions(transRes.data);
      setAnalytics(analyticsRes.data || {});
      setUser(freshUser); 
      localStorage.setItem('user', JSON.stringify(freshUser)); 

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

  const handleWithdrawal = async (withdrawData) => {
    if (!withdrawData.amount || Number(withdrawData.amount) > user.walletBalance) {
      return toast.error("Check amount or balance");
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/transactions/request`, withdrawData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success("Payout requested!");
      setIsWithdrawOpen(false);
      fetchArtisanData(); 
    } catch (err) {
      toast.error("Request failed");
    }
  };

  const handleFinishJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/jobs/${jobId}`, { status: 'awaiting_confirmation' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Job marked finished! Awaiting client approval.");
      fetchArtisanData(); 
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/auth/update-photo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}` 
        }
      });
      toast.success("Profile Photo Updated!");
      setUser({ ...user, profilePic: res.data.profilePic });
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadInvoice = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/jobs/${jobId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Invoice download failed");
    }
  };

  const handleUpgradeToGold = async () => {
    try {
      setSubscriptionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/payment/subscription/initialize`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start subscription payment");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handlePortfolioUpload = async (files) => {
    if (!files || files.length === 0) return;
    setPortfolioUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('portfolio', file));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/artisan/portfolio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const nextUser = { ...user, portfolio: res.data.portfolio || [] };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      toast.success("Portfolio uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Portfolio upload failed");
    } finally {
      setPortfolioUploading(false);
    }
  };

  const deletePortfolioItem = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE}/artisan/portfolio/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nextUser = { ...user, portfolio: res.data.portfolio || [] };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      toast.success("Portfolio item removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0B0F1A] font-black uppercase text-blue-600 tracking-widest animate-pulse">
      Securing Cockpit Access...
    </div>
  );

  const verification = getVerificationTimelineState(user);

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col transition-colors duration-700">
        <Navbar />
        
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 relative z-10 w-full"
        >
          
          <motion.div variants={itemVariants} className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Artisan <span className="text-blue-600">Cockpit</span></h1>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mt-3 italic">Business Intelligence v2.0</p>
            </div>
            
            <motion.button 
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSettingsOpen(true)}
              className="w-16 h-16 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center shadow-2xl border border-white/40 dark:border-white/10 text-gray-400 hover:text-blue-600 transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-12 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-2xl shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Identity Verification</p>
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white mt-2">
                  {verification.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-2">{verification.note}</p>
              </div>
              {!verification.isVerified && (
                <button
                  onClick={() => navigate('/profile-setup')}
                  className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start md:self-auto"
                >
                  {verification.hasIdUploaded ? 'Update Documents' : 'Submit Documents'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {verification.steps.map((step) => (
                <div
                  key={step.key}
                  className={`rounded-2xl border p-5 transition-all ${
                    step.done
                      ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-700/30'
                      : step.active
                        ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/30'
                        : 'bg-gray-50/80 dark:bg-black/20 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300">{step.label}</p>
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black ${
                        step.done
                          ? 'bg-green-600 text-white'
                          : step.active
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {step.done ? 'OK' : step.active ? '...' : '--'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div variants={itemVariants}
              className="bg-gray-900 dark:bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <p className="text-[10px] font-black text-blue-400 dark:text-blue-200 uppercase tracking-widest mb-2">Available Balance</p>
              <h3 className="text-5xl font-black tracking-tighter italic">GHS {user.walletBalance || 0}</h3>
              <button 
                onClick={() => setIsWithdrawOpen(true)}
                className="mt-6 text-[10px] font-black uppercase bg-white text-black px-6 py-3 rounded-2xl hover:bg-black hover:text-white transition-all shadow-lg">
                Withdraw Funds
              </button>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </motion.div>

            <motion.div variants={itemVariants}
              className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Locked in Escrow</p>
              <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                GHS {jobs.filter(j => j.status === 'paid' || j.status === 'awaiting_confirmation').reduce((a, b) => a + (b.amount || 0), 0)}
              </h3>
            </motion.div>

            <motion.div variants={itemVariants}
              className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Reputation</p>
              <div className="flex items-center gap-3">
                 <span className="text-5xl font-black text-gray-900 dark:text-white italic">{user.rating || "5.0"}</span>
                 <span className="text-2xl text-yellow-400">*</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div variants={itemVariants}
              className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Earned This Month</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">GHS {analytics.totalEarnedThisMonth || 0}</h3>
            </motion.div>

            <motion.div variants={itemVariants}
              className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Profile Views Today</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">{analytics.profileViewsToday || 0}</h3>
            </motion.div>

            <motion.div variants={itemVariants}
              className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Success Rate</p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">{analytics.successRate || 0}%</h3>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mb-16 bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LinkUp Gold</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic mt-2">
                {analytics.isGoldPro ? "Active Pro Tier" : "Unlock Premium Placement"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                Top search placement, faster verification priority, and high-value job access.
              </p>
              {analytics.subscriptionExpiresAt && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-3">
                  Expires: {new Date(analytics.subscriptionExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {!analytics.isGoldPro && (
              <button
                onClick={handleUpgradeToGold}
                disabled={subscriptionLoading}
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-60"
              >
                {subscriptionLoading ? "Connecting..." : "Upgrade to Gold"}
              </button>
            )}
          </motion.div>

          <motion.h3 variants={itemVariants} className="text-2xl font-black text-gray-900 dark:text-white uppercase italic mb-10 tracking-tighter">Live <span className="text-blue-600">Engagements</span></motion.h3>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <AnimatePresence>
              {jobs.length > 0 ? jobs.map(job => (
                <motion.div 
                  layout key={job._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter line-clamp-1">{job.description || "Service Request"}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 italic">Partner: {job.client?.username || 'Verified Client'}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${job.status === 'completed' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white animate-pulse'}`}>
                      {job.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">GHS {job.amount || job.price}</p>
                    <div className="flex items-center gap-2">
                      {job.status === 'paid' && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFinishJob(job._id)}
                          className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl transition-all"
                        >
                          Mark Finished
                        </motion.button>
                      )}
                      {job.status === 'completed' && (
                        <button
                          onClick={() => handleDownloadInvoice(job._id)}
                          className="px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.2rem]"
                        >
                          Invoice PDF
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-24 text-center bg-white/20 dark:bg-black/10 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/20">
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.5em]">No Active Deployments</p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.h3 variants={itemVariants} className="text-2xl font-black text-gray-900 dark:text-white uppercase italic mb-10 tracking-tighter">Financial <span className="text-blue-600">Logs</span></motion.h3>
          <motion.div variants={itemVariants} className="space-y-4 mb-20">
            {transactions.length > 0 ? transactions.map(t => (
              <div key={t._id} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex justify-between items-center transition-all hover:bg-white/60">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${t.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}>
                    {t.status === 'completed' ? 'OK' : '!'}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">Payout to {t.momoNumber}</h4>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.network} - {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900 dark:text-white italic">- GHS {t.amount}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${t.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{t.status}</p>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-white/10 rounded-[3rem] border border-dashed border-white/20 italic text-gray-400 uppercase font-black text-[10px] tracking-widest">No Payout Requests Found</div>
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsDrawer 
              user={user} 
              setUser={setUser} 
              onClose={() => setIsSettingsOpen(false)} 
              API_BASE={API_BASE} 
              handlePhotoUpload={handlePhotoUpload}
              uploading={uploading}
              handlePortfolioUpload={handlePortfolioUpload}
              deletePortfolioItem={deletePortfolioItem}
              portfolioUploading={portfolioUploading}
            />
          )}
          {isWithdrawOpen && (
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onConfirm={handleWithdrawal} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

const WithdrawModal = ({ isOpen, onClose, onConfirm }) => {
  const [data, setData] = useState({ amount: '', momoNumber: '', network: 'MTN' });
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-lg p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic mb-6">Request <span className="text-blue-600">Payout</span></h2>
        <div className="space-y-4">
          <input type="number" placeholder="Amount (GHS)" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white font-bold" 
            onChange={(e) => setData({...data, amount: e.target.value})} />
          <input type="text" placeholder="MoMo Number" className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white font-bold" 
            onChange={(e) => setData({...data, momoNumber: e.target.value})} />
          <select className="w-full p-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white font-bold"
            onChange={(e) => setData({...data, network: e.target.value})}>
            <option value="MTN">MTN MoMo</option>
            <option value="Telecel">Telecel Cash</option>
            <option value="AT">AT Money</option>
          </select>
          <button onClick={() => onConfirm(data)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl mt-4">
            Request GHS {data.amount || '0'}
          </button>
          <button onClick={onClose} className="w-full text-gray-400 text-[10px] font-black uppercase mt-2">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
};

const SettingsDrawer = ({ user, setUser, onClose, API_BASE, handlePhotoUpload, uploading, handlePortfolioUpload, deletePortfolioItem, portfolioUploading }) => {
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
      await axios.put(`${API_BASE}/artisan/update-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, ...editData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Identity Synchronized");
      onClose();
    } catch (err) { 
      toast.error("Update failed: Check connection"); 
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl z-[200] p-12 shadow-2xl overflow-y-auto border-l border-white/20"
      >
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Profile <span className="text-blue-600">Setup</span></h2>
          <button onClick={onClose} className="text-gray-300 hover:text-black dark:hover:text-white text-4xl font-light">X</button>
        </div>

        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 shadow-xl mb-10">
          <div className="flex items-center gap-6">
            <div className="relative group w-24 h-24">
              <img 
                src={user.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : `/${user.profilePic}`) : `https://ui-avatars.com/api/?name=${user.username}`} 
                className="w-full h-full rounded-3xl object-cover border-4 border-white shadow-lg" 
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                <span className="text-white text-[8px] font-black uppercase">{uploading ? "..." : "Change"}</span>
                <input type="file" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Update Identity</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Visible to all clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/30 shadow-xl mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Portfolio Gallery</h4>
            <label className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer">
              {portfolioUploading ? "Uploading..." : "Add Images"}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePortfolioUpload(e.target.files)}
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(user.portfolio || []).length > 0 ? (user.portfolio || []).map((item, index) => (
              <div key={`${item.imageUrl}-${index}`} className="relative group">
                <img src={item.imageUrl} alt="Portfolio" className="w-full h-20 object-cover rounded-xl border border-white/30" />
                <button
                  type="button"
                  onClick={() => deletePortfolioItem(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white w-6 h-6 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                >
                  x
                </button>
              </div>
            )) : (
              <p className="col-span-3 text-[10px] font-black uppercase tracking-widest text-gray-400">No portfolio images yet.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Phone Identity</label>
            <input type="text" value={editData.phone} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Rate per Session (GHS)</label>
            <input type="number" value={editData.price} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" onChange={(e) => setEditData({...editData, price: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Active Location</label>
            <input type="text" value={editData.location} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" onChange={(e) => setEditData({...editData, location: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Professional Bio</label>
            <textarea value={editData.bio} className="w-full p-5 bg-gray-100 dark:bg-black/20 rounded-2xl font-medium h-32 border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white" onChange={(e) => setEditData({...editData, bio: e.target.value})} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/40 mt-8">Update Identity</motion.button>
        </form>
      </motion.div>
    </>
  );
};

export default ArtisanDashboard;



