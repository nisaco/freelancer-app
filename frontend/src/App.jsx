import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion'; // <--- FIX 1: Missing Import
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import PaymentCallback from './pages/PaymentCallback';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import ArtisanDashboard from './pages/ArtisanDashboard';
import Welcome from './pages/Welcome'; // Import the new name
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';


// <--- FIX 2: Location must be used INSIDE a sub-component or a wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile-setup" element={<ProtectedRoute role="artisan"><ProfileSetup /></ProtectedRoute>} />
        <Route path="/artisan-dashboard" element={<ProtectedRoute role="artisan"><ArtisanDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;