import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    price: ''
  });

  const categories = ['Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Mechanic'];

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

    const profileData = {
      serviceCategory: finalCategory,
      location: formData.location,
      bio: formData.bio,
      startingPrice: formData.price,
      ghanaCardNumber: formData.ghanaCardNumber
    };

    try {
      const token = localStorage.getItem('token');
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/artisan/profile' 
        : 'https://hireme-bk0l.onrender.com/api/artisan/profile';

      // Submit to the Artisan Profile route
      const response = await axios.post(API_URL, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update LocalStorage with the fresh user data from the server
      // This fixes the "Guest" issue immediately
      localStorage.setItem('user', JSON.stringify(response.data));

      toast.success("Profile updated successfully!");
      navigate('/artisan-dashboard');
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Professional Setup</h2>
        <p className="text-gray-500 mb-8">Tell us about your services to start receiving jobs.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service Category</label>
              <select name="category" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100">
                <option value="">Select...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other (Type below)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (GHS)</label>
              <input type="number" name="price" placeholder="100" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100" />
            </div>
          </div>

          {isOther && (
            <input 
              type="text" name="customCategory" placeholder="Enter your profession" 
              onChange={handleInputChange} required className="w-full p-4 border-2 border-blue-100 rounded-xl outline-none" 
            />
          )}

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Business Location</label>
             <input type="text" name="location" placeholder="e.g. Accra" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100" />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
             <textarea name="bio" placeholder="Experience..." onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 h-32" />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl disabled:bg-gray-400"
          >
            {loading ? "SAVING..." : "COMPLETE SETUP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;