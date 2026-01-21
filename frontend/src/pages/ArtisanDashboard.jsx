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

  if (loading) return <div className="p-10 text-center font-bold">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* SETUP PROMPT: Only shows if profile is new/incomplete */}
        {profile?.isNewArtisan && (
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-8 rounded-r-2xl flex justify-between items-center shadow-sm">
            <div>
              <p className="text-amber-800 font-bold">Incomplete Profile</p>
              <p className="text-amber-700 text-sm">Set up your professional details to start appearing in search results.</p>
            </div>
            <Link to="/setup-profile" className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-amber-700 transition">
              Finish Setup
            </Link>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Welcome, {user.username}</h1>
            <p className="text-gray-500 font-medium">Account Status: {profile?.user?.isVerified ? "Verified ✅" : "Pending Review ⏳"}</p>
          </div>
          {/* ... Verified Badge Logic ... */}
        </div>
        {/* ... Rest of Dashboard (Bookings) ... */}
      </div>
    </div>
  );
};

export default ArtisanDashboard;