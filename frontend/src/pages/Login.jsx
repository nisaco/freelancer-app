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
      // --- IMPORTANT: CHECK THIS URL ---
      // If running locally, use: 'http://localhost:5000/api/auth/login'
      // If deploying, use your Render URL: 'https://hireme-bk0l.onrender.com/api/auth/login'
      
      const API_URL = 'https://hireme-bk0l.onrender.com/api/auth/login'; 

      const response = await axios.post(
        API_URL, 
        { email, password }, // The data payload
        { headers: { 'Content-Type': 'application/json' } } // Explicitly tell server it's JSON
      );

      if (response.data) {
        // Save the token and user data
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // If your backend sends a token separately:
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        alert('Login Successful! Welcome back.');
        navigate('/'); // Go to Dashboard/Home
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      
      const message = 
        (error.response && error.response.data && error.response.data.message) || 
        'Login failed. Please check your email and password.';
        
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;