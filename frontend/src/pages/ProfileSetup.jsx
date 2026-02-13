import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isOther, setIsOther] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    location: '',
    bio: '',
    ghanaCardNumber: '',
    price: '',
    profilePic: null,
    ghanaCardImage: null
  });

  const categories = ['Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Mechanic', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'Other') setIsOther(true);
    else if (name === 'category') setIsOther(false);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalCategory = isOther ? formData.customCategory : formData.category;

    if (!formData.ghanaCardImage) {
      setLoading(false);
      return toast.warn("Please upload your Ghana Card photo for verification.");
    }

    const payload = new FormData();
    payload.append('category', finalCategory);
    payload.append('location', formData.location);
    payload.append('bio', formData.bio);
    payload.append('ghanaCardNumber', formData.ghanaCardNumber);
    payload.append('price', formData.price);
    if (formData.profilePic) payload.append('profilePic', formData.profilePic);
    if (formData.ghanaCardImage) payload.append('ghanaCardImage', formData.ghanaCardImage);

    try {
      const token = localStorage.getItem('token');
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
      
      await axios.put(`${API_BASE}/upload/profile-setup`, payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      toast.success("Profile setup complete!");
      navigate('/artisan-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* Container is transparent to let Living Background show through */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        {/* LIVING BACKGROUND */}
        <div className="living-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/20 relative z-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
              Complete Your <span className="text-blue-600">Profile</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
              Join the elite artisans of Ghana
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selection */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] ml-2 mb-2 block">Service Category</label>
              <select 
                name="category" 
                onChange={handleInputChange} 
                required 
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm transition-all cursor-pointer"
              >
                <option value="">Select your craft...</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {isOther && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <input 
                  type="text" 
                  name="customCategory" 
                  placeholder="Specify your category..." 
                  onChange={handleInputChange} 
                  required 
                  className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm"
                />
              </motion.div>
            )}

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] ml-2 mb-2 block">Starting Price (GHS)</label>
                <input 
                  type="number" 
                  name="price" 
                  placeholder="0.00" 
                  onChange={handleInputChange} 
                  required 
                  className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] ml-2 mb-2 block">Base Location</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. Accra, Kumasi" 
                  onChange={handleInputChange} 
                  required 
                  className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm"
                />
              </div>
            </div>

            {/* Ghana Card Number */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] ml-2 mb-2 block">Ghana Card Number</label>
              <input 
                type="text" 
                name="ghanaCardNumber" 
                placeholder="GHA-000000000-0" 
                onChange={handleInputChange} 
                required 
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] ml-2 mb-2 block">Professional Bio</label>
              <textarea 
                name="bio" 
                placeholder="Describe your experience and skills..." 
                onChange={handleInputChange} 
                required 
                className="w-full p-5 bg-white dark:bg-black/20 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 dark:text-white shadow-sm h-32 resize-none"
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 hover:border-blue-500 transition-colors">
                <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] mb-2">Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, profilePic: e.target.files[0] || null })}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 hover:border-blue-500 transition-colors">
                <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em] mb-2">Ghana Card Photo (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFormData({ ...formData, ghanaCardImage: e.target.files[0] || null })}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-widest text-xs mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SAVING..." : "COMPLETE SETUP"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ProfileSetup;