import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import PaymentCallback from './pages/PaymentCallback';
import Login from './pages/Login';
import Register from './pages/Register';
import Join from './pages/Join'; // <--- NEW
import ArtisanSetup from './pages/ArtisanSetup'; // <--- NEW
import Dashboard from './pages/Dashboard';
import ArtisanDashboard from './pages/ArtisanDashboard';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';
import ArtisanProfile from './pages/ArtisanProfile';
import Messages from './pages/Messages';
import Inbox from './pages/Inbox';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProfileSetup from './pages/ProfileSetup';
import AdminUsers from './pages/AdminUsers';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} /> 
        <Route path="/join" element={<Join />} /> {/* <--- NEW */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
         <Route path="/admin-terminal" element={<AdminDashboard />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/artisan/:id" element={<ArtisanProfile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* New Robust Onboarding Flow */}
        <Route path="/artisan-setup" element={<ProtectedRoute role="artisan"><ArtisanSetup /></ProtectedRoute>} />
          <Route path="/profile-setup" element={<ProtectedRoute role="artisan"><ProfileSetup /></ProtectedRoute>} />      
        <Route path="/artisan-dashboard" element={<ProtectedRoute role="artisan"><ArtisanDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute role="artisan"><Onboarding /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
       
        <Route
          path="/messages"
          element={<ProtectedRoute><Navigate to="/inbox" replace /></ProtectedRoute>}
        />
        <Route path="/messages/:recipientId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
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