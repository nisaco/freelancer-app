import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client', // Default role
  });

  const { username, email, password, role } = formData;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/auth/register' 
        : 'https://hireme-bk0l.onrender.com/api/auth/register';

      const response = await axios.post(API_URL, formData);

      if (response.data) {
        toast.success('Registration Successful!');
        
        // Save user data and token immediately so they stay logged in
        localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // --- DIRECTION LOGIC ---
        if (role === 'artisan') {
          // Send artisans to upload their Ghana Card and Bio
          navigate('/profile-setup');
        } else {
          // Send clients to the marketplace
          navigate('/dashboard');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Join HireMe</h2>
          <p className="text-gray-500 font-medium">Create your account to get started</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* --- ROLE SELECTOR --- */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'client' })}
              className={`p-4 rounded-2xl border-2 transition-all text-center ${
                role === 'client' 
                ? 'border-blue-600 bg-blue-50 text-blue-600' 
                : 'border-gray-100 text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">🏠</div>
              <div className="font-bold text-xs uppercase">I want to Hire</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'artisan' })}
              className={`p-4 rounded-2xl border-2 transition-all text-center ${
                role === 'artisan' 
                ? 'border-blue-600 bg-blue-50 text-blue-600' 
                : 'border-gray-100 text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">🛠️</div>
              <div className="font-bold text-xs uppercase">I'm an Artisan</div>
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              required
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition shadow-lg disabled:bg-gray-400"
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;