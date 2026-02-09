import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Onboarding = () => {
  const [profileImg, setProfileImg] = useState(null);
  const [ghanaCard, setGhanaCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileImg || !ghanaCard) return toast.warn("Upload both photos");

    setLoading(true);
    const formData = new FormData();
    formData.append('profilePic', profileImg);
    formData.append('ghanaCard', ghanaCard);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/auth/onboarding`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      toast.success("Verification documents submitted!");
    } catch (err) { toast.error("Upload failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl">
      <h2 className="text-2xl font-black uppercase italic mb-8">Artisan <span className="text-blue-600">Onboarding</span></h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Public Profile Picture</label>
          <input type="file" onChange={(e) => setProfileImg(e.target.files[0])} className="w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">Ghana Card (Secret - Admin Only)</label>
          <input type="file" onChange={(e) => setGhanaCard(e.target.files[0])} className="w-full" />
        </div>
        <button disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black uppercase rounded-2xl">
          {loading ? "UPLOADING..." : "SUBMIT FOR REVIEW"}
        </button>
      </form>
    </div>
  );
};