import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobItem from '../components/JobItem';

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Mechanic'];

  const filterCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(j => j.category?.toLowerCase() === cat.toLowerCase()));
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading HireMe Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">HIREME</h1>
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="text-gray-500 hover:text-red-500 font-semibold text-sm transition"
        > Logout </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Find an Artisan</h2>
        
        {/* Category Chips */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => filterCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-md scale-105' 
                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Artisan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => <JobItem key={job._id} job={job} />)
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 text-lg italic">No artisans found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;