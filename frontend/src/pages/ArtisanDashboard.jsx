import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ArtisanDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch LATEST data from User model via the /me endpoint
      const userRes = await axios.get(`${API_BASE}/artisan/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Set the state with fresh DB data (this hides the skeleton if category exists)
      setCurrentUser(userRes.data);

      // 3. Update localStorage so the rest of the app is also updated
      localStorage.setItem('user', JSON.stringify(userRes.data));

      // 4. Fetch Job History (Bookings)
      const jobsRes = await axios.get(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to show jobs assigned to this specific artisan
      setBookings(jobsRes.data.filter(job => job.artisan._id === userRes.data._id));

    } catch (err) {
      console.error("Sync Error:", err);
      toast.error("Failed to sync your profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Syncing Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* --- DYNAMIC VIEW: Show setup prompt ONLY if category is missing in DB --- */}
        {!currentUser?.category ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-blue-200 text-center mb-10 shadow-sm">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome, {currentUser.username}!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven't finished your professional setup. Clients cannot see you in the marketplace yet.
            </p>
            <Link to="/profile-setup" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl">
              Finish Profile Setup
            </Link>
          </div>
        ) : (
          /* --- FULL DASHBOARD VIEW: Shows once category is saved --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Your Profession</p>
              <h2 className="text-3xl font-black mb-6">{currentUser.category}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Hourly Rate</p>
              <h2 className="text-3xl font-black">GHS {currentUser.price || 0}</h2>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Bio</h3>
               <p className="text-gray-500 leading-relaxed italic">
                 "{currentUser.bio || "No professional bio provided yet."}"
               </p>
            </div>
          </div>
        )}

        {/* --- SHARED HEADER: Uses isVerified from your User.js model --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Artisan Portal</h1>
            <p className="text-sm font-medium text-gray-400">
              Official Status: {currentUser?.isVerified ? "Verified ✅" : "Verification Pending ⏳"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             {currentUser?.isVerified ? (
               <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold text-xs border border-green-100 uppercase">🛡️ Verified Business</div>
             ) : (
               <div className="bg-amber-50 text-amber-700 px-6 py-2 rounded-full font-bold text-xs border border-amber-100 uppercase tracking-widest">⏳ Pending Review</div>
             )}
          </div>
        </div>

        {/* --- BOOKINGS SECTION (Always Visible) --- */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">Recent Job Requests</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {bookings.length} Total
            </span>
          </div>

          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(job => (
                <div key={job._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{job.client?.username}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase">{new Date(job.date).toDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      job.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 italic">"{job.description}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">You haven't received any job requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;