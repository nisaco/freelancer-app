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
  const [searchTerm, setSearchTerm] = useState('');
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
    const token = localStorage.getItem('token'); // Get the token
    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: { 
        Authorization: `Bearer ${token}` // Send it to the server
      }
    });
    setJobs(response.data);
    setFilteredJobs(response.data);
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
  } finally {
    setLoading(false);
  }
};

  // --- LOGIC: Handle Category & Search Together ---
  useEffect(() => {
    let result = jobs;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(job => job.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Search Term (Title or Description)
    if (searchTerm) {
      result = result.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(result);
  }, [selectedCategory, searchTerm, jobs]);

  const categories = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Mechanic', 'Tiler', 'Welder', 'Caterer'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HERO SECTION --- */}
        <div className="bg-blue-600 rounded-3xl p-8 mb-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Expert Artisans</h2>
            <p className="text-blue-100 text-lg">Verified professionals at your fingertips.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
        </div>

        {/* --- SEARCH BAR (The scale fix) --- */}
        <div className="relative -mt-10 mb-10 max-w-xl mx-auto z-20">
          <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-gray-100">
            <div className="p-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for a service..." 
              className="w-full p-2 outline-none text-gray-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- DYNAMIC CATEGORY SCROLL --- */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</h3>
            <span className="text-[10px] text-blue-400 md:hidden italic">Swipe left/right →</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-400 hover:text-blue-600'
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
              <p className="text-gray-400 text-lg">No artisans found for this selection.</p>
              <button onClick={() => {setSearchTerm(''); setSelectedCategory('All')}} className="mt-4 text-blue-600 font-bold underline">Clear filters</button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;