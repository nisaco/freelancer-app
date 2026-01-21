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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch Profile Details
      const profileRes = await axios.get('https://hireme-bk0l.onrender.com/api/artisan/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileRes.data);

      // Fetch Bookings
      const jobsRes = await axios.get('https://hireme-bk0l.onrender.com/api/jobs/my-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(jobsRes.data);
    } catch (err) {
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* --- PROFILE COMPLETION ALERT --- */}
        {(!profile || profile.isNewArtisan) && (
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6 rounded-r-2xl flex justify-between items-center">
            <div>
              <p className="text-amber-700 font-bold">Your profile is incomplete!</p>
              <p className="text-amber-600 text-sm">Clients cannot see your rates or bio until you finish setup.</p>
            </div>
            <Link to="/setup-profile" className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
              Complete Setup
            </Link>
          </div>
        )}

        {/* --- HEADER --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Welcome, {user.username}</h1>
            <p className="text-gray-500 font-medium">Dashboard Status: {profile?.user?.isVerified ? "Verified" : "Pending"}</p>
          </div>
          <div className="mt-6 md:mt-0">
            {profile?.user?.isVerified ? (
              <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl font-black text-sm border border-blue-100">🛡️ VERIFIED</div>
            ) : (
              <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl font-black text-sm border border-amber-100 uppercase">⏳ PENDING</div>
            )}
          </div>
        </div>

        {/* ... Rest of your dashboard code showing bookings ... */}
      </div>
    </div>
  );
};

export default ArtisanDashboard;