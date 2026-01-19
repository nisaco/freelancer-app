import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isOther, setIsOther] = useState(false);

  // Initialize form with local storage data to ensure we don't lose the user object
  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    location: '',
    bio: '',
    ghanaCardNumber: '',
    price: ''
  });

  const [profilePic, setProfilePic] = useState(null);
  const [idCardImage, setIdCardImage] = useState(null);

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

    const data = new FormData();
    data.append('category', finalCategory);
    data.append('location', formData.location);
    data.append('bio', formData.bio);
    data.append('price', formData.price);
    data.append('ghanaCardNumber', formData.ghanaCardNumber);
    
    if (profilePic) data.append('profilePic', profilePic);
    if (idCardImage) data.append('ghanaCardImage', idCardImage);

    try {
      const token = localStorage.getItem('token');
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/upload' 
        : 'https://hireme-bk0l.onrender.com/api/upload';

      const response = await axios.put(`${API_URL}/profile-setup`, data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // --- CRITICAL CHANGE: UPDATE LOCAL STORAGE ---
      // This ensures the next time the app checks user.category, it finds the new value
      const updatedUser = { 
        ...user, 
        category: finalCategory, 
        price: formData.price,
        location: formData.location,
        isPending: true 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Profile submitted! Awaiting verification.");
      
      // Redirect straight to the Artisan Dashboard cockpit
      navigate('/artisan-dashboard');
      
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Professional Setup</h2>
        <p className="text-gray-500 mb-8">This information helps clients trust and hire you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Public Profile Photo */}
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-dashed border-blue-200">
            <label className="block text-sm font-bold text-blue-800 mb-2 uppercase tracking-wider">Public Profile Picture</label>
            <input 
              type="file" 
              accept="image/*" 
              required
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            <p className="mt-2 text-[10px] text-blue-400">This photo will be visible to all customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service Category</label>
              <select name="category" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other (Type below)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (GHS)</label>
              <input type="number" name="price" placeholder="e.g. 100" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {isOther && (
            <input 
              type="text" name="customCategory" placeholder="e.g. Solar Installer" 
              onChange={handleInputChange} required className="w-full p-4 border-2 border-blue-100 rounded-xl outline-none focus:border-blue-500" 
            />
          )}

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Business Location</label>
             <input type="text" name="location" placeholder="e.g. East Legon, Accra" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
             <textarea name="bio" placeholder="Describe your experience and work quality..." onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32" />
          </div>

          {/* Private Verification Photo */}
          <div className="bg-red-50 p-6 rounded-2xl border-2 border-dashed border-red-100">
            <label className="block text-sm font-bold text-red-800 mb-2 uppercase tracking-tight">Ghana Card Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              required
              onChange={(e) => setIdCardImage(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
            />
            <p className="mt-2 text-[10px] text-red-400 font-bold italic underline">PRIVATE: Clients will never see this document.</p>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Ghana Card Number</label>
             <input type="text" name="ghanaCardNumber" placeholder="GHA-7XXXXXXX-X" onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "UPLOADING IDENTITY DOCUMENTS..." : "COMPLETE SETUP & GO TO PORTAL"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;