import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/admin/pending', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPending(res.data);
  };

  const handleVerify = async (id, status) => {
    const token = localStorage.getItem('token');
    await axios.put(`/api/admin/verify/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success(`Artisan ${status}d`);
    fetchPending();
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-black mb-10">Verification Queue</h1>
      <div className="grid gap-6">
        {pending.map(artisan => (
          <div key={artisan._id} className="bg-white p-8 rounded-3xl shadow-sm border flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{artisan.username} ({artisan.category})</h2>
              <p className="text-gray-500 text-sm">Ghana Card: {artisan.ghanaCardNumber}</p>
              <a href={artisan.ghanaCardImage} target="_blank" className="text-blue-600 text-xs font-bold underline">View Identity Document</a>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleVerify(artisan._id, 'approve')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Approve</button>
              <button onClick={() => handleVerify(artisan._id, 'reject')} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;