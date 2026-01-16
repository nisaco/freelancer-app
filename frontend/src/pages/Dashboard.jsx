import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobItem from '../components/JobItem';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(loggedInUser));
      fetchJobs();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Category Filtering
  useEffect(() => {
    if (category === 'All') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.category === category));
    }
  }, [category, jobs]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="p-10 text-center">Loading Artisans...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-blue-600">HIREME</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-red-500 text-sm font-bold border border-red-500 px-3 py-1 rounded hover:bg-red-50">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Category Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Find an Artisan</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['All', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <p className="text-gray-400">No {category} artisans found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobItem key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;