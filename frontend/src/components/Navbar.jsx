import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo - Always points to the user's home base */}
          <Link 
            to={user?.role === 'artisan' ? '/artisan-dashboard' : '/dashboard'} 
            className="text-2xl font-black text-blue-600 tracking-tighter"
          >
            HIREME
          </Link>
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* Dynamic Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {user?.role === 'artisan' ? (
                <Link to="/artisan-dashboard" className="text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-widest">
                  Artisan Portal
                </Link>
              ) : (
                <Link to="/dashboard" className="text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-widest">
                  Find Artisans
                </Link>
              )}
              
              {/* Optional: Add a link for bookings/history that both can see */}
              <Link to="/bookings" className="text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-widest">
                My Jobs
              </Link>
            </div>

            <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-blue-500 uppercase leading-none mb-1">
                  {user?.role || 'Guest'}
                </p>
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {user?.username || 'User'}
                </p>
              </div>
              
              <button 
                onClick={logout}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-red-600 transition-all duration-300 shadow-lg shadow-gray-200 active:scale-95"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;