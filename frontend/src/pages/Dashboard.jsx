import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import JobItem from '../components/JobItem'; // Your artisan card component
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [artisans, setArtisans] = useState([]);
  const [filteredArtisans, setFilteredArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/upload' // Adjust to your specific route
    : 'https://hireme-bk0l.onrender.com/api/upload';

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // --- THE FIX: ADDING HEADERS ---
        const response = await axios.get(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setArtisans(response.data);
        setFilteredArtisans(response.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        if (error.response?.status === 401) {
          navigate('/login'); // Redirect if token is invalid
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, [navigate]);

  // Search/Filter Logic
  useEffect(() => {
    const results = artisans.filter(a =>
      a.category?.toLowerCase().includes(search.toLowerCase()) ||
      a.username?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredArtisans(results);
  }, [search, artisans]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Find Professional Help</h1>
          <input
            type="text"
            placeholder="Search by category (e.g. Plumber)..."
            className="w-full max-w-xl p-4 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center font-bold text-gray-500">Loading artisans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtisans.map((artisan) => (
              <JobItem key={artisan._id} artisan={artisan} />
            ))}
          </div>
        )}
        
        {!loading && filteredArtisans.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No artisans found in this category yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;