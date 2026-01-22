import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'https://hireme-bk0l.onrender.com/api/auth/login';

      const response = await axios.post(API_URL, { email, password });

      if (response.data) {
        const userData = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);

        if (userData.role === 'admin') navigate('/admin-dashboard');
        else if (userData.role === 'artisan') navigate('/artisan-dashboard');
        else navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">HireMe</h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Dynamic type
              name="password"
              placeholder="Password"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-xs font-bold text-blue-600 uppercase"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg disabled:bg-blue-300"
          >
            {loading ? 'Verifying...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;