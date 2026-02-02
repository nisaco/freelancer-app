import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper to determine active link styling
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO */}
          <Link 
            to={user?.role === 'artisan' ? '/artisan-dashboard' : '/dashboard'} 
            className="text-2xl font-black text-blue-600 tracking-tighter"
          >
            HIREME
          </Link>
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* DYNAMIC NAVIGATION LINKS */}
            <div className="hidden md:flex items-center gap-8">
              {user?.role === 'artisan' ? (
                <>
                  <Link 
                    to="/artisan-dashboard" 
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive('/artisan-dashboard') ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
                  >
                    Cockpit
                  </Link>
                  {/* Artisans view their received jobs here */}
                  <Link 
                    to="/artisan-dashboard" 
                    className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em]"
                  >
                    My Tasks
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
                  >
                    Marketplace
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive('/my-bookings') ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
                  >
                    My Bookings
                  </Link>
                </>
              )}
            </div>

            {/* USER PROFILE & LOGOUT */}
            <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-blue-500 uppercase leading-none mb-1 tracking-widest">
                  {user?.role || 'Guest'}
                </p>
                <p className="text-sm font-black text-gray-900 leading-none tracking-tight">
                  {user?.username || 'User'}
                </p>
              </div>
              
              <button 
                onClick={logout}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;