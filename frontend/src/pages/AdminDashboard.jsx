import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: {}, pendingArtisans: [] });
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
      toast.error("Failed to load admin data");
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
      toast.success(`Artisan successfully ${status}ed`);
      fetchData(); // Refresh counts and list
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Admin Console...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-10">
        
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Admin Command Center</h1>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Artisans</p>
            <h2 className="text-4xl font-black text-blue-600">{data.stats.totalArtisans}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Clients</p>
            <h2 className="text-4xl font-black text-gray-900">{data.stats.totalClients}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Users</p>
            <h2 className="text-4xl font-black text-green-500">{data.stats.totalUsers}</h2>
          </div>
        </div>

        {/* --- VERIFICATION QUEUE --- */}
        <h3 className="text-xl font-black text-gray-900 mb-6">Pending Verifications ({data.pendingArtisans.length})</h3>
        <div className="grid gap-6">
          {data.pendingArtisans.length > 0 ? (
            data.pendingArtisans.map(artisan => (
              <div key={artisan._id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{artisan.username}</h2>
                  <p className="text-blue-600 font-bold text-sm uppercase">{artisan.category}</p>
                  <p className="text-gray-500 text-xs mt-1">ID: {artisan.ghanaCardNumber}</p>
                  <a href={artisan.ghanaCardImage} target="_blank" rel="noreferrer" className="text-blue-500 text-xs underline font-bold mt-2 inline-block">
                    View Ghana Card Proof
                  </a>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <button onClick={() => handleVerify(artisan._id, 'approve')} className="flex-1 lg:flex-none bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-green-700 transition">APPROVE</button>
                  <button onClick={() => handleVerify(artisan._id, 'reject')} className="flex-1 lg:flex-none bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black text-xs hover:bg-red-100 transition">REJECT</button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 italic">No artisans are currently waiting for verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;