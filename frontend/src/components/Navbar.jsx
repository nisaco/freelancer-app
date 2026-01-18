import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-black text-blue-600">HIREME</Link>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-600">Welcome, {user?.name || 'User'}</span>
            <button 
              onClick={logout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-100 transition"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;