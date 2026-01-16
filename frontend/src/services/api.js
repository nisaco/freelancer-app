import axios from 'axios';

// Create a central instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // This points to your Node server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Advanced: Automatically attach the token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // We will save the token here on login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;