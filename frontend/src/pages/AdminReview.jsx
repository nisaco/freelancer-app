import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReview = () => {
  const [artisans, setArtisans] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPending = async () => {
      const res = await axios.get('/api/admin/pending-artisans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtisans(res.data);
    };
    fetchPending();
  }, []);

  const handleVerify = async (id) => {
    await axios.put(`/api/admin/verify/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setArtisans(artisans.filter(a => a._id !== id)); // Remove from list once verified
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-10 text-white pt-32">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Identity <span className="text-blue-600">Review</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artisans.map(artisan => (
          <div key={artisan._id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem]">
            <img src={artisan.profilePic} className="w-16 h-16 rounded-2xl mb-4 object-cover" />
            <h3 className="font-bold text-lg">{artisan.username}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">{artisan.category}</p>
            
            <div className="bg-black/40 rounded-2xl p-4 mb-4">
               <p className="text-[8px] text-gray-500 uppercase mb-2">Ghana Card Image</p>
               <img src={artisan.ghanaCard} className="w-full h-32 object-contain rounded-lg border border-white/5" />
            </div>

            <button 
              onClick={() => handleVerify(artisan._id)}
              className="w-full py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
            >
              Verify Identity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};