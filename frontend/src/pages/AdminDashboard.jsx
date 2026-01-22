import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: { totalArtisans: 0, totalClients: 0, totalUsers: 0 }, pendingArtisans: [] });
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/admin' 
    : 'https://hireme-bk0l.onrender.com/api/admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/verify/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Artisan ${status === 'approve' ? 'Verified' : 'Rejected'}`);
      fetchData(); // Refresh metrics and list
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-600 uppercase tracking-tighter">Syncing Command Center...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Admin Console</h1>

        {/* --- METRICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Artisans</p>
            <h2 className="text-4xl font-black text-blue-600">{data.stats.totalArtisans}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Clients</p>
            <h2 className="text-4xl font-black text-gray-900">{data.stats.totalClients}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Users</p>
            <h2 className="text-4xl font-black text-green-500">{data.stats.totalUsers}</h2>
          </div>
        </div>

        {/* --- VERIFICATION LIST --- */}
        <h3 className="text-xl font-black text-gray-900 mb-6">Verification Queue ({data.pendingArtisans.length})</h3>
        <div className="grid gap-4">
          {data.pendingArtisans.length > 0 ? (
            data.pendingArtisans.map(artisan => (
              <div key={artisan._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-lg">{artisan.username}</h4>
                  <p className="text-blue-600 text-xs font-black uppercase">{artisan.category}</p>
                  <a href={artisan.ghanaCardImage} target="_blank" rel="noreferrer" className="text-blue-500 text-[10px] font-bold underline mt-1 inline-block uppercase">View ID Document</a>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => handleVerify(artisan._id, 'approve')} className="flex-1 bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-green-700 transition">APPROVE</button>
                  <button onClick={() => handleVerify(artisan._id, 'reject')} className="flex-1 bg-red-50 text-red-600 px-6 py-2 rounded-xl font-black text-xs hover:bg-red-100 transition">REJECT</button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed">
              <p className="text-gray-400 italic">No pending verifications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;