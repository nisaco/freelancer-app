import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Data States
  const [myProfile, setMyProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [artisans, setArtisans] = useState([]);
  
  // UI States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState(null); // For booking
  const [reviewTargetId, setReviewTargetId] = useState(null);   // For reviewing

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);

    // FETCH DATA
    if (storedUser.role === 'artisan') {
      api.get('/artisan/me').then(res => setMyProfile(res.data)).catch(() => setMyProfile(null));
    }
    
    // Fetch jobs for BOTH Client and Artisan (To show history)
    api.get('/jobs').then(res => setJobs(res.data)).catch(err => console.error(err));

  }, [navigate]);

  const fetchArtisans = async (category) => {
    setLoading(true);
    setSelectedCategory(category);
    try {
      const { data } = await api.get(`/artisan?category=${category}`);
      setArtisans(data);
    } catch (error) {
      toast.error('Failed to load artisans');
    } finally {
      setLoading(false);
    }
  };

  // Open Booking Modal
  const handleBookClick = (artisanProfile) => {
    if (!artisanProfile.user) return;
    setSelectedArtisan({
      id: artisanProfile.user._id, 
      name: artisanProfile.user.username 
    });
    setIsBookModalOpen(true);
  };

  // Handle Job Status Changes (Accept/Reject/Complete)
  const handleJobAction = async (jobId, newStatus) => {
    try {
      const { data } = await api.put(`/jobs/${jobId}`, { status: newStatus });
      toast.success(`Job ${newStatus}`);
      // Update local state instantly
      setJobs(jobs.map(job => job._id === jobId ? data : job));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Helper: Format WhatsApp URL
  const getWhatsAppLink = (number) => {
    const cleanNumber = number.replace(/\D/g, ''); 
    if (cleanNumber.startsWith('0')) {
      return `https://wa.me/233${cleanNumber.substring(1)}`;
    }
    return `https://wa.me/233${cleanNumber}`;
  };

  // Filter Search Logic
  const filteredArtisans = artisans.filter(artisan => 
    artisan.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary">ArtisanConnect</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:inline">Welcome, <b>{user.username}</b></span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-10 px-4">
        
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{user.role === 'client' ? 'Find a Pro' : 'Your Workspace'}</h2>
            <p className="text-gray-600 mt-2">Logged in as <span className="uppercase font-bold text-secondary">{user.role}</span>.</p>
          </div>
          
          {/* Search Bar (Client Only) */}
          {user.role === 'client' && selectedCategory && (
            <div className="w-full md:w-1/3">
              <input 
                type="text" 
                placeholder="Filter by City (e.g. Accra)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          )}
        </div>

        {/* ================= ARTISAN VIEW ================= */}
        {user.role === 'artisan' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${myProfile ? 'border-green-500' : 'border-secondary'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{myProfile ? 'Profile Active' : 'Complete Profile'}</h3>
                  <p className="text-gray-600 mb-4">{myProfile ? `Active as ${myProfile.serviceCategory}` : 'Setup required.'}</p>
                </div>
                {myProfile && <img src={myProfile.profileImage} alt="Me" className="w-16 h-16 rounded-full object-cover"/>}
              </div>
              <Link to="/profile-setup" className="block w-full text-center bg-gray-800 text-white px-4 py-2 rounded">Edit Profile</Link>
            </div>

            {/* Job Manager */}
            <div className="bg-white p-6 rounded-lg shadow h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Incoming Requests</h3>
              {jobs.length === 0 ? <p className="text-gray-500">No jobs yet.</p> : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job._id} className="border p-4 rounded bg-gray-50 relative">
                      <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded uppercase ${job.status === 'completed' ? 'bg-blue-100 text-blue-800' : job.status === 'accepted' ? 'bg-green-100 text-green-800' : job.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {job.status}
                      </span>
                      <h4 className="font-bold">{job.serviceType}</h4>
                      <p className="text-sm text-gray-600">{job.description}</p>
                      <div className="text-xs text-gray-500 mt-2 mb-2">
                         📅 {new Date(job.date).toLocaleDateString()} • 👤 {job.client?.username}
                      </div>

                      {/* ARTISAN CONTROLS */}
                      {job.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleJobAction(job._id, 'accepted')} className="bg-green-500 text-white px-3 py-1 rounded w-full hover:bg-green-600">Accept</button>
                          <button onClick={() => handleJobAction(job._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded w-full hover:bg-red-600">Reject</button>
                        </div>
                      )}
                      {job.status === 'accepted' && (
                        <button onClick={() => handleJobAction(job._id, 'completed')} className="bg-blue-600 text-white px-3 py-2 rounded w-full hover:bg-blue-700 font-bold">
                          Mark As Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* ================= CLIENT VIEW ================= */
          <div className="flex flex-col-reverse md:flex-col gap-8">
            
            {/* 1. Job History Section (Visible always so they can track/review) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Your Job History</h3>
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven't booked any jobs yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map(job => (
                    <div key={job._id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                      <div>
                        <h4 className="font-bold text-sm">{job.serviceType}</h4>
                        <p className="text-xs text-gray-500">with {job.artisan?.username || 'Artisan'}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block ${job.status === 'completed' ? 'bg-blue-100 text-blue-800' : job.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      {/* REVIEW BUTTON (Only if Completed) */}
                      {job.status === 'completed' && (
                        <button 
                          onClick={() => {
                            setReviewTargetId(job.artisan._id);
                            setIsReviewModalOpen(true);
                          }}
                          className="bg-yellow-400 text-white text-xs px-3 py-2 rounded hover:bg-yellow-500 font-bold shadow-sm"
                        >
                          ★ Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Search & Browse Section */}
            <div>
              {!selectedCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {['Carpenter', 'Electrician', 'Plumber', 'Painter', 'Mason', 'Mechanic'].map((cat) => (
                    <div key={cat} onClick={() => fetchArtisans(cat)} className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer hover:border-secondary border border-transparent transition">
                      <h3 className="font-bold text-lg">{cat}</h3>
                      <p className="text-sm text-gray-500">View available pros</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <button onClick={() => { setSelectedCategory(null); setArtisans([]); setSearchQuery(''); }} className="mb-4 text-gray-500 hover:text-primary">← Back to Categories</button>
                  <h3 className="text-2xl font-bold text-primary mb-6">Available {selectedCategory}s</h3>
                  
                  {filteredArtisans.length === 0 ? (
                    <div className="bg-yellow-50 p-4 rounded text-yellow-700 border border-yellow-200">No artisans found matching "{searchQuery}".</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArtisans.map((profile) => (
                        <div key={profile._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition flex flex-col h-full">
                          <div className="h-48 bg-gray-200 relative">
                             <img src={profile.profileImage || "https://via.placeholder.com/300"} alt="Pro" className="w-full h-full object-cover"/>
                             <span className="absolute top-2 right-2 bg-white/90 text-secondary text-xs px-2 py-1 rounded-full font-bold">{profile.serviceCategory}</span>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{profile.user?.username}</h3>
                              <p className="text-lg font-bold text-secondary">GHS {profile.startingPrice}</p>
                            </div>
                            
                            <div className="flex text-yellow-400 mb-2">
                              <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-gray-300">★</span>
                              <span className="text-gray-400 text-xs ml-2 mt-1">(4.0)</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{profile.bio}</p>
                            <div className="text-sm text-gray-500 mb-6">📍 {profile.location}</div>

                            <div className="pt-4 border-t border-gray-100 mt-auto flex gap-2">
                              <a href={`tel:${profile.phoneNumber}`} className="bg-blue-50 text-blue-600 p-2 rounded text-center hover:bg-blue-100 flex-1 transition">📞 Call</a>
                              <a href={getWhatsAppLink(profile.phoneNumber)} target="_blank" rel="noreferrer" className="bg-green-100 text-green-600 p-2 rounded text-center hover:bg-green-200 flex-1 transition">💬 Chat</a>
                              <button onClick={() => handleBookClick(profile)} className="bg-secondary text-white p-2 rounded flex-1 hover:bg-blue-700 transition">Book</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALS */}
        {selectedArtisan && (
          <BookingModal 
            isOpen={isBookModalOpen} 
            onClose={() => setIsBookModalOpen(false)} 
            artisanId={selectedArtisan.id} 
            artisanName={selectedArtisan.name} 
          />
        )}
        
        {reviewTargetId && (
          <ReviewModal 
            isOpen={isReviewModalOpen} 
            onClose={() => setIsReviewModalOpen(false)} 
            artisanId={reviewTargetId} 
          />
        )}

      </div>
    </div>
  );
};

export default Dashboard;