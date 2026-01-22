import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ArtisanDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get the logged-in user data (which contains category, bio, etc.)
  const user = JSON.parse(localStorage.getItem('user'));

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const jobsRes = await axios.get(`${API_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter jobs where this user is the artisan
      setBookings(jobsRes.data.filter(job => job.artisan._id === user._id));
    } catch (err) {
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* --- DYNAMIC VIEW LOGIC --- */}
        {/* If category is missing from the User object, show the setup box */}
        {!user.category ? (
          <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-blue-200 text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Almost there, {user.username}!</h2>
            <p className="text-gray-500 mb-6">Complete your professional profile to appear in the marketplace.</p>
            <Link to="/profile-setup" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg inline-block">
              Finish Profile Setup
            </Link>
          </div>
        ) : (
          /* --- FULL ACTUAL DASHBOARD --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Service</p>
              <h2 className="text-2xl font-black mb-4">{user.category}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Price</p>
              <h2 className="text-2xl font-black">GHS {user.price || 0}</h2>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-2">Professional Bio</h3>
               <p className="text-gray-500 text-sm">{user.bio || "No bio set."}</p>
            </div>
          </div>
        )}

        {/* --- HEADER (Using your actual isVerified field) --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Portal</h1>
            <p className="text-gray-500 font-medium">
              Status: {user.isVerified ? "Verified ✅" : "Pending Approval ⏳"}
            </p>
          </div>
        </div>

        {/* --- BOOKINGS --- */}
        <div className="mt-10">
          <h3 className="text-xl font-black text-gray-900 mb-6">Recent Job Requests</h3>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(job => (
                <div key={job._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between items-center">
                   <div>
                     <p className="font-bold">{job.client.username}</p>
                     <p className="text-sm text-gray-400">{new Date(job.date).toLocaleDateString()}</p>
                   </div>
                   <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">
                     {job.status}
                   </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-100">
               <p className="text-gray-400 italic">No job requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;