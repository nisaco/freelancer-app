import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentCallback from './pages/PaymentCallback'; // <--- Import
// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home'; // <--- IMPORT HOME

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* MAKE HOME THE DEFAULT ROUTE */}
        <Route path="/" element={<Home />} /> 
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
      </Routes>
    </Router>
  );
}

export default App;