import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle'; // Just adding the import

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    // Added dark:bg-darkBg/80 and dark:border-darkBorder
    <nav className="sticky top-0 z-[100] bg-white/80 dark:bg-darkBg/80 backdrop-blur-xl border-b border-gray-100 dark:border-darkBorder transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO - Added dark:text-white */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
            <span className="text-white dark:text-black font-black text-xl italic">H</span>
          </div>
          <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl">HireMe</span>
        </Link>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-4">
          
          {/* 1. THE THEME TOGGLE ADDED HERE */}
          <ThemeToggle />

          {user && (
            // Added dark:border-darkBorder
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100 dark:border-darkBorder">
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Welcome back</p>
                {/* Added dark:text-white */}
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.username}</p>
              </div>
              
              {/* Added dark:bg-white dark:text-black */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
              >
                Logout
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;