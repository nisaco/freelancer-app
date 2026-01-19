import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic to auto-switch URL based on where the app is running
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'https://hireme-bk0l.onrender.com/api/auth/login';

      const response = await axios.post(
        API_URL, 
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        const userData = response.data.user || response.data; // Handle different backend response structures
        const token = response.data.token;

        // 1. Save critical data
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('token', token);
        }

        // 2. --- ROLE-BASED REDIRECTION LOGIC ---
        // We check if the user is an artisan or a client (passenger)
        if (userData.role === 'artisan') {
          // If the artisan hasn't finished their profile (category is missing), send to setup
          if (!userData.category) {
            navigate('/profile-setup');
          } else {
            // Otherwise, send them to their specific Artisan Portal
            navigate('/artisan-dashboard');
          }
        } else {
          // Regular clients go to the marketplace dashboard
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">HireMe</h2>
          <p className="text-gray-500 font-medium">Welcome back, login to continue</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-sm">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition duration-300 shadow-lg shadow-blue-100 disabled:bg-blue-300"
          >
            {loading ? 'Verifying...' : 'LOGIN'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            New to HireMe?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;