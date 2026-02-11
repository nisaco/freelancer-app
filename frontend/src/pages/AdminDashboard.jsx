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
  // --- FRONTEND SHIELD: Initial State Structure ---
  const [data, setData] = useState({ 
    stats: { 
      totalArtisans: 0, 
      totalClients: 0, 
      totalUsers: 0, 
      totalVolume: 0,
      revenue: { totalVolume: 0 } // Nested shield
    }, 
    pendingArtisans: [],
    recentTransactions: [] 
  });
  const [payouts, setPayouts] = useState([]);
  const [allArtisans, setAllArtisans] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [activeDisputeDetail, setActiveDisputeDetail] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://linkup-bk0l.onrender.com/api';

  useEffect(() => {
    fetchData();
    fetchPayouts();
    fetchAllArtisans();
    fetchDisputes();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Safety: Ensure we don't save null/undefined to state
      if (res.data) setData(res.data);
    } catch (err) {
      console.error("Stats load error:", err);
      toast.error("Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/transactions/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(res.data || []);
    } catch (err) {
      console.error("Payout load failed");
    }
  };

  const fetchAllArtisans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/admin/artisans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllArtisans(res.data || []);
    } catch (err) {
      console.error("Artisan list load failed");
    }
  };

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/disputes/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisputes(res.data || []);
    } catch (err) {
      console.error("Dispute load failed");
    }
  };

  const openDispute = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/disputes/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveDisputeDetail(res.data);
      setAdminNotes(res.data?.dispute?.adminNotes || "");
    } catch (err) {
      toast.error("Failed to load dispute detail");
    }
  };

  const resolveDispute = async (resolution) => {
    if (!activeDisputeDetail?.dispute?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/disputes/admin/${activeDisputeDetail.dispute._id}/resolve`, {
        resolution,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Dispute resolved");
      setActiveDisputeDetail(null);
      setAdminNotes("");
      fetchDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Resolution failed");
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/admin/verify/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Identity ${status === 'approve' ? 'Verified' : 'Rejected'}`);
      fetchData(); 
      fetchAllArtisans();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Confirm MoMo payment sent?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/transactions/complete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Payout marked as Paid");
      fetchPayouts();
    } catch (err) {
      toast.error("Payment confirmation failed");
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
          className="max-w-7xl mx-auto px-6 pt-16 md:pt-32 relative z-10 w-full"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Admin <span className="text-blue-600">Console</span>
            </h1>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mt-4 italic">Network Governance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              // --- FRONTEND SHIELD: Optional Chaining on Values ---
              { label: 'Network Volume', value: `GHS ${data?.stats?.revenue?.totalVolume || data?.stats?.totalVolume || 0}`, color: 'text-blue-600' },
              { label: 'Artisans', value: data?.stats?.totalArtisans || 0, color: 'text-gray-900 dark:text-white' },
              { label: 'Clients', value: data?.stats?.totalClients || 0, color: 'text-gray-900 dark:text-white' },
              { label: 'Total Users', value: data?.stats?.totalUsers || 0, color: 'text-green-500' }
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-2xl">
                <p className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                <h2 className={`text-4xl font-black tracking-tighter italic ${stat.color}`}>{stat.value}</h2>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Verification <span className="text-blue-600">Queue</span></h3>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {/* SHIELD: Safe mapping with fallback array */}
                  {(data?.pendingArtisans || []).map((artisan) => (
                    <motion.div key={artisan._id} layout variants={itemVariants} exit={{ opacity: 0, x: 20 }} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 shadow-xl flex flex-col md:flex-row md:justify-between md:items-center gap-5 group">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 border-white"><img src={`https://ui-avatars.com/api/?name=${artisan.username}&background=random`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" /></div>
                        <div>
                          <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase italic tracking-tighter">{artisan.username}</h4>
                          <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">{artisan.category}</p>
                          <a href={artisan.ghanaCardImage} target="_blank" rel="noreferrer" className="text-gray-400 text-[8px] font-bold underline mt-1 inline-block uppercase tracking-widest">Verify ID</a>
                        </div>
                      </div>
                      <div className="flex w-full md:w-auto gap-2">
                        <button onClick={() => handleVerify(artisan._id, 'approve')} className="bg-green-600 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex-1 md:flex-none">Approve</button>
                        <button onClick={() => handleVerify(artisan._id, 'reject')} className="bg-white/10 text-red-500 px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-500/20 flex-1 md:flex-none">Reject</button>
                      </div>
                    </motion.div>
                  ))}
                  {(data?.pendingArtisans || []).length === 0 && (
                    <div className="py-14 text-center bg-white/10 rounded-[2rem] border border-dashed border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No pending artisan verification requests.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Live <span className="text-blue-600">Feed</span></h3>
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/40 p-8 shadow-2xl h-[500px] overflow-y-auto no-scrollbar">
                <div className="space-y-8">
                  {(data?.recentTransactions || []).map((tx, i) => (
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

          <motion.div variants={itemVariants} className="pb-12">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Artisan <span className="text-blue-600">Verification Manager</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(allArtisans || []).map((artisan) => (
                <div key={artisan._id} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-[1.8rem] border border-white/20 shadow-lg flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase italic truncate">{artisan.username}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{artisan.category || 'Artisan'}</p>
                  </div>
                  {artisan.isVerified ? (
                    <button onClick={() => handleVerify(artisan._id, 'unverify')} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                      Unverify
                    </button>
                  ) : (
                    <button onClick={() => handleVerify(artisan._id, 'approve')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                      Verify Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pb-12">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Dispute <span className="text-blue-600">Tickets</span></h3>
            <div className="space-y-4">
              {(disputes || []).length > 0 ? (disputes || []).map((d) => (
                <div key={d._id} className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-[1.8rem] border border-white/20 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{d.ticketId}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1 truncate">
                      {d.client?.username} vs {d.artisan?.username} - {d.reason}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">{d.description || "No extra details"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                      d.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                      {d.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => openDispute(d._id)}
                      className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    >
                      Review
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-14 text-center bg-white/10 rounded-[2rem] border border-dashed border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No active disputes.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* PAYOUT MANAGEMENT SECTION */}
          <motion.div variants={itemVariants} className="pb-24">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">Payout <span className="text-blue-600">Requests</span></h3>
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-8 text-[10px] font-black uppercase text-gray-400">Artisan</th>
                      <th className="p-8 text-[10px] font-black uppercase text-gray-400">MoMo Details</th>
                      <th className="p-8 text-[10px] font-black uppercase text-gray-400">Amount</th>
                      <th className="p-8 text-[10px] font-black uppercase text-gray-400">Status</th>
                      <th className="p-8 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(payouts || []).map((p) => (
                      <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-8 font-black text-gray-900 dark:text-white uppercase italic">{p.user?.username}</td>
                        <td className="p-8">
                          <p className="text-sm font-black text-blue-600 tracking-tighter">{p.momoNumber}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase mt-1">{p.network}</p>
                        </td>
                        <td className="p-8 text-xl font-black text-gray-900 dark:text-white italic tracking-tighter">GHS {p.amount}</td>
                        <td className="p-8">
                          <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black animate-pulse'}`}>{p.status}</span>
                        </td>
                        <td className="p-8 text-right">
                          {p.status === 'pending' && (
                            <button onClick={() => markAsPaid(p._id)} className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg">Confirm Paid</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {activeDisputeDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] border border-white/20 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {activeDisputeDetail.dispute.ticketId}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">
                      {activeDisputeDetail.dispute.client?.username} vs {activeDisputeDetail.dispute.artisan?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDisputeDetail(null)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-black uppercase"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Job Details</p>
                    <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                      {activeDisputeDetail.dispute.job?.description || "Service Request"}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Amount: GHS {activeDisputeDetail.dispute.job?.amount || 0}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Status: {activeDisputeDetail.dispute.job?.status || "unknown"}
                    </p>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Complaint</p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                      {activeDisputeDetail.dispute.reason}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {activeDisputeDetail.dispute.description || "No description provided."}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Chat History</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {(activeDisputeDetail.messages || []).length > 0 ? (activeDisputeDetail.messages || []).map((m) => (
                        <div key={m._id} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-white/10">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{m.content}</p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500">No chat history found for this pair.</p>
                      )}
                    </div>
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
                  <button onClick={() => resolveDispute('release_to_artisan')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Release to Artisan</button>
                  <button onClick={() => resolveDispute('refund_client')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Refund Client</button>
                  <button onClick={() => resolveDispute('hold_funds')} className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Hold Funds</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;

