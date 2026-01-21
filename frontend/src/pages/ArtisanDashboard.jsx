import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ArtisanDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileRes = await axios.get(`${API_URL}/artisan/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileRes.data);

      const jobsRes = await axios.get(`${API_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(jobsRes.data.filter(job => job.artisan._id === user._id));
    } catch (err) {
      toast.error("Dashboard failed to load");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* VIEW A: NEW USER SKELETON (Show this if no profile exists) */}
        {profile?.isNewArtisan ? (
          <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-blue-200 text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Almost there, {user.username}!</h2>
            <p className="text-gray-500 mb-6">You need to set up your professional profile before you can receive bookings.</p>
            <Link to="/setup-profile" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">
              Finish Profile Setup
            </Link>
          </div>
        ) : (
          /* VIEW B: FULL ACTUAL DASHBOARD (Show this if profile is complete) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Service</p>
              <h2 className="text-2xl font-black mb-4">{profile.serviceCategory}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Rate</p>
              <h2 className="text-2xl font-black">GHS {profile.startingPrice}</h2>
            </div>
            {/* Add more stat cards here for the full dashboard */}
          </div>
        )}

        {/* SHARED HEADER (Verification Status) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Portal</h1>
            <p className="text-gray-500 font-medium">Status: {profile?.user?.isVerified ? "Verified ✅" : "Pending Approval ⏳"}</p>
          </div>
          <div className="mt-4 md:mt-0">
             {profile?.user?.isVerified ? (
               <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-xs">🛡️ VERIFIED BUSINESS</span>
             ) : (
               <span className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-bold text-xs uppercase">⏳ Verification Pending</span>
             )}
          </div>
        </div>

        {/* Bookings Section (Visible to both) */}
        {/* ... bookings mapping code ... */}
      </div>
    </div>
  );
};

export default ArtisanDashboard;