import axios from 'axios';

// Create a central instance
const api = axios.create({
    //  // This points to your Node server
  //...baseURL: 'http://localhost:5000/api',
    baseURL: 'https://hireme-bk0l.onrender.com/api', // <--- NEW LIVE URL

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