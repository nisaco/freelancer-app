import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobItem from '../components/JobItem';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Automatically switches between Local and Render
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    } else {
      fetchJobs();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Mechanic'];

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.category?.toLowerCase() === cat.toLowerCase()));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HERO SECTION --- */}
        <div className="bg-blue-600 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Need a professional?</h2>
            <p className="text-blue-100 text-lg mb-6">
              Book verified artisans in Ghana. Pay a small deposit to secure your appointment instantly.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
        </div>

        {/* --- CATEGORY FILTER --- */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Service Categories</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- ARTISAN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <JobItem key={job._id} job={job} />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-lg">No artisans available in the <span className="font-bold text-blue-600">{selectedCategory}</span> category yet.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;