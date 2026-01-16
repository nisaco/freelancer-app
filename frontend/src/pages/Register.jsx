import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // For the popup alerts
import api from '../services/api'; // Our central API handler

const Register = () => {
  const navigate = useNavigate();
  
  // 1. STATE: This holds what the user types
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client', // Default is client
  });

  const { username, email, password, role } = formData;

  // 2. LOGIC: Update state when user types
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // 3. LOGIC: Send data to backend when "Submit" is clicked
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      // The actual API call
      const response = await api.post('/auth/register', formData);

      // If successful:
      toast.success('Registration Successful! Please Login.');
      navigate('/login'); // Send them to login page
    } catch (error) {
      // If error (e.g., email already taken):
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Create Account</h2>
          <p className="text-gray-500 mt-2">Join as a client or artisan</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Role Selection (Crucial for your app) */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">I want to...</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
            >
              <option value="client">Hire Artisan (I am a Client)</option>
              <option value="artisan">Find Work (I am an Artisan)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Register
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;