import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const ArtisanDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/jobs' 
    : 'https://hireme-bk0l.onrender.com/api/jobs';

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to show only jobs assigned to this artisan
      setBookings(res.data.filter(job => job.artisan._id === user._id));
    } catch (err) {
      toast.error("Could not fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${jobId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Job marked as ${newStatus}`);
      fetchMyBookings(); // Refresh list
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-10">
        {/* --- HEADER & STATUS --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Welcome, {user.username}</h1>
            <p className="text-gray-500 font-medium">Manage your service requests and availability.</p>
          </div>
          <div className="mt-6 md:mt-0">
            {user.isVerified ? (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl font-black text-sm border border-blue-100">
                <span className="text-xl">🛡️</span> VERIFIED BUSINESS
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl font-black text-sm border border-amber-100 uppercase">
                <span className="text-xl">⏳</span> Verification Pending
              </div>
            )}
          </div>
        </div>

        {/* --- BOOKINGS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* STATS COLUMN */}
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Your Skill</p>
              <h2 className="text-2xl font-black mb-4">{user.category || 'Not Assigned'}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Hourly Rate</p>
              <h2 className="text-2xl font-black">GHS {user.price || 0}</h2>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Pro Tip 💡</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Verified artisans get 10x more bookings. Make sure your Ghana Card and Passport photos are clear for our admins.
              </p>
            </div>
          </div>

          {/* JOB REQUESTS COLUMN */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-black text-gray-900 mb-6">Recent Job Requests</h3>
            
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map(job => (
                  <div key={job._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                        {job.status}
                      </span>
                      <h4 className="font-bold text-lg text-gray-900">{job.client.username}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{job.description}</p>
                      <p className="text-xs text-gray-400 font-bold mt-2">📅 {new Date(job.date).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      {job.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(job._id, 'accepted')}
                            className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition"
                          > Accept </button>
                          <button 
                            onClick={() => handleStatusUpdate(job._id, 'rejected')}
                            className="bg-red-50 text-red-500 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition"
                          > Decline </button>
                        </>
                      )}
                      {job.status === 'accepted' && (
                        <button 
                          onClick={() => handleStatusUpdate(job._id, 'completed')}
                          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm"
                        > Mark Completed </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                <div className="text-4xl mb-4 text-gray-200">📭</div>
                <p className="text-gray-400 font-medium italic">No requests yet. Once a client books you, they will appear here!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;