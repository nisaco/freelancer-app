import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // --- STATE ---
  const [data, setData] = useState({ 
    stats: { 
      totalArtisans: 0, 
      totalClients: 0, 
      totalUsers: 0, 
      totalVolume: 0,
      revenue: { totalVolume: 0 } 
    }, 
    pendingArtisans: [],
    recentTransactions: [] 
  });
  const [payouts, setPayouts] = useState([]);
  const [allArtisans, setAllArtisans] = useState([]); // This holds the pending verification queue
  const [disputes, setDisputes] = useState([]);
  const [activeDisputeDetail, setActiveDisputeDetail] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, payoutsRes, pendingRes, disputesRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/transactions/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/pending-artisans`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/disputes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setData(prev => ({
          ...prev,
          ...statsRes.data,
          stats: {
            ...prev.stats,
            ...statsRes.data.stats,
            revenue: { totalVolume: statsRes.data.stats?.totalVolume || 0 }
          }
        }));
        
        setPayouts(payoutsRes.data);
        setAllArtisans(pendingRes.data);
        setDisputes(disputesRes.data);

      } catch (err) {
        toast.error("Failed to load admin dashboard data");
        console.error(err);
      }
    };

    if (token) fetchAdminData();
  }, [token]);

  // --- HANDLERS ---

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/admin/verify/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllArtisans(allArtisans.filter(a => a._id !== id));
      toast.success(`Artisan ${status === 'approve' ? 'verified' : 'rejected'}`);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handlePayout = async (id) => {
    try {
      await axios.put(`${API_BASE}/transactions/complete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(payouts.map(p => p._id === id ? { ...p, status: 'completed' } : p));
      toast.success("Payout marked completed");
    } catch (err) {
      toast.error("Failed to process payout");
    }
  };

  const openDispute = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/admin/disputes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveDisputeDetail(res.data);
    } catch (err) {
      toast.error("Failed to load dispute details");
    }
  };

  const resolveDispute = async (resolution) => {
    if (!adminNotes) return toast.warn("Please add admin notes first");
    try {
      await axios.post(`${API_BASE}/disputes/resolve/${activeDisputeDetail.dispute._id}`, 
        { resolution, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Dispute resolved");
      setActiveDisputeDetail(null);
      // Remove resolved dispute from list locally
      setDisputes(disputes.filter(d => d._id !== activeDisputeDetail.dispute._id));
    } catch (err) {
      toast.error("Failed to resolve dispute");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0B0F1A] pb-20">
        <Navbar />
        <div className="living-bg"><div className="orb orb-1 opacity-20" /><div className="orb orb-2 opacity-20" /></div>

        <div className="max-w-7xl mx-auto px-6 pt-10">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                Admin <span className="text-blue-600">Terminal</span>
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                System Overview & Control
              </p>
            </div>
            
            {/* NEW: Button to User Management Page */}
            <button 
              onClick={() => navigate('/admin-users')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12">
              
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Users", val: data.stats.totalUsers, color: "text-blue-600" },
                  { label: "Pending Artisans", val: allArtisans.length, color: "text-orange-500" },
                  { label: "Active Disputes", val: disputes.filter(d => d.status !== 'resolved').length, color: "text-red-500" },
                  { label: "Network Volume", val: `GHS ${data.stats.revenue?.totalVolume?.toLocaleString() || 0}`, color: "text-green-500" }
                ].map((stat, i) => (
                  <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.val}</p>
                  </motion.div>
                ))}
              </div>

              {/* TWO COLUMN LAYOUT: Verification & Payouts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* IDENTITY VERIFICATION QUEUE */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl h-96 overflow-y-auto">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic mb-6 sticky top-0 bg-white dark:bg-[#151a25] z-10 pb-4">Identity <span className="text-orange-500">Queue</span></h3>
                  <div className="space-y-4">
                    {allArtisans.length > 0 ? allArtisans.map((artisan) => (
                      <div key={artisan._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img src={artisan.profilePic || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{artisan.username}</p>
                            {artisan.ghanaCardImage && (
                              <a href={artisan.ghanaCardImage} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 underline font-bold">View ID Card</a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerify(artisan._id, 'approve')} className="text-green-500 font-black text-[10px] uppercase border border-green-500 px-3 py-1 rounded-lg hover:bg-green-500 hover:text-white transition">Approve</button>
                          <button onClick={() => handleVerify(artisan._id, 'reject')} className="text-red-500 font-black text-[10px] uppercase border border-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition">Reject</button>
                        </div>
                      </div>
                    )) : <p className="text-gray-400 text-sm italic">No pending verifications.</p>}
                  </div>
                </motion.div>

                {/* PAYOUT REQUESTS QUEUE */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl h-96 overflow-y-auto">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic mb-6 sticky top-0 bg-white dark:bg-[#151a25] z-10 pb-4">Payout <span className="text-green-500">Requests</span></h3>
                  <div className="space-y-4">
                    {payouts.filter(p => p.status === 'pending').length > 0 ? payouts.filter(p => p.status === 'pending').map((payout) => (
                      <div key={payout._id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">GHS {payout.amount}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">{payout.momoNumber} ({payout.network})</p>
                          <p className="text-[10px] text-blue-500 font-bold">{payout.user?.username}</p>
                        </div>
                        <button onClick={() => handlePayout(payout._id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Mark Paid</button>
                      </div>
                    )) : <p className="text-gray-400 text-sm italic">No pending payouts.</p>}
                  </div>
                </motion.div>
              </div>

              {/* DISPUTE CENTER */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic mb-6">Dispute <span className="text-red-500">Resolution</span></h3>
                <div className="space-y-4">
                  {disputes.length > 0 ? disputes.map(d => (
                    <div key={d._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{d.reason}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                          Job: {d.job?.serviceType} • Raised by: {d.raisedBy?.username}
                        </p>
                      </div>
                      <button onClick={() => openDispute(d._id)} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Review Case</button>
                    </div>
                  )) : <p className="text-gray-400 text-sm italic">No active disputes.</p>}
                </div>
              </motion.div>

            </motion.div>
          </AnimatePresence>

          {/* DISPUTE DETAILS MODAL */}
          <AnimatePresence>
            {activeDisputeDetail && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="bg-white dark:bg-[#151a25] w-full max-w-2xl rounded-[2rem] p-8 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Case File <span className="text-red-500">#{activeDisputeDetail.dispute.ticketId || 'Unknown'}</span></h2>
                    <button onClick={() => setActiveDisputeDetail(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client</p>
                      <p className="font-bold text-gray-900 dark:text-white">{activeDisputeDetail.dispute.client?.username}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Artisan</p>
                      <p className="font-bold text-gray-900 dark:text-white">{activeDisputeDetail.dispute.artisan?.username}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Evidence Submitted</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {activeDisputeDetail.evidence?.map((ev, i) => (
                        <a key={i} href={ev.imageUrl} target="_blank" rel="noreferrer">
                          <img src={ev.imageUrl} className="w-full h-24 object-cover rounded-xl border border-white/10 hover:opacity-80 transition" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Chat Log</h4>
                    <div className="h-40 overflow-y-auto bg-gray-50 dark:bg-black/20 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-white/5">
                      {activeDisputeDetail.messages?.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === activeDisputeDetail.dispute.client._id ? 'justify-end' : 'justify-start'}`}>
                          <span className={`px-3 py-2 rounded-xl text-xs ${msg.sender === activeDisputeDetail.dispute.client._id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full mt-2 h-24 rounded-xl p-3 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 dark:text-white"
                      placeholder="Document your decision rationale."
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => resolveDispute('release_to_artisan')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700">Release to Artisan</button>
                    <button onClick={() => resolveDispute('refund_client')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Refund Client</button>
                    <button onClick={() => resolveDispute('hold_funds')} className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400">Hold Funds</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;