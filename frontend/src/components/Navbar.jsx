import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://hireme-bk0l.onrender.com/api';

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCounts(); // NEW: Initial fetch for badge counts
      
      // Poll for new data every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCounts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, location.pathname]); // Re-fetch on route change

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Notif Error:", err);
    }
  };

  // --- NEW: FETCH UNREAD COUNTS LOGIC ---
  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadNotifs(res.data.notifications || 0);
      setUnreadMessages(res.data.messages || 0);
    } catch (err) {
      console.error("Count Error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE}/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadNotifs(0); // Instantly clear the badge
    } catch (err) {
      console.error("Mark read failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Derived count for notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex justify-between items-center bg-white/10 dark:bg-black/10 backdrop-blur-2xl border-b border-white/20">
      
      {/* LOGO */}
      <Link to="/" className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">
        HIRE<span className="text-blue-600">ME</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-6">
        
        {/* NAVIGATION LINKS (HIDDEN ON MOBILE) */}
        <div className="hidden md:flex gap-6 items-center mr-4">
          <Link to={user?.role === 'artisan' ? '/artisan-dashboard' : '/dashboard'} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
        </div>

        {/* MESSAGE HUB ICON - UPDATED WITH UNREAD BADGE */}
        <Link 
          to="/inbox" 
          className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors relative"
          title="Messages"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-gray-900">
              {unreadMessages}
            </span>
          )}
        </Link>

        {/* NOTIFICATION BELL */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              if (!isNotifOpen) markAllAsRead();
            }}
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {(unreadCount > 0 || unreadNotifs > 0) && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-gray-900">
                {unreadNotifs || unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-[-50px] md:right-0 mt-6 w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-6 z-[110]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Feed</h4>
                  {(unreadCount > 0 || unreadNotifs > 0) && <span className="text-[8px] font-black text-blue-600 uppercase">New Alerts</span>}
                </div>

                <div className="max-h-80 overflow-y-auto no-scrollbar space-y-3">
                  {notifications.length > 0 ? notifications.map((n) => (
                    <div key={n._id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-gray-50/50 dark:bg-white/5 border-transparent' : 'bg-blue-50/50 dark:bg-blue-600/10 border-blue-100 dark:border-blue-900/30'}`}>
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-relaxed">{n.message || n.content}</p>
                      <p className="text-[8px] font-black text-blue-500 mt-2 uppercase tracking-tighter">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )) : (
                    <div className="py-12 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">All caught up</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* USER PROFILE DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="w-10 h-10 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center overflow-hidden shadow-xl border border-white/20"
          >
            <img 
              src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=000&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                className="absolute right-0 mt-6 w-56 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/10 p-4 z-[110]"
              >
                <div className="px-4 py-3 mb-2">
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{user?.username}</p>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user?.role}</p>
                </div>
                <div className="h-[1px] bg-gray-100 dark:bg-white/5 mb-2 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
