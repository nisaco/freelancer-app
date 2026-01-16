import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProfileSetup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    serviceCategory: 'Carpenter',
    bio: '',
    location: '',
    phoneNumber: '',
    startingPrice: '',
    profileImage: '',
    // --- NEW: Default Schedule ---
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workStartTime: '08:00',
    workEndTime: '17:00'
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Destructure for easier usage in form
  const { 
    serviceCategory, bio, location, phoneNumber, startingPrice, profileImage,
    workingDays, workStartTime, workEndTime 
  } = formData;

  // 1. Fetch Existing Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/artisan/me');
        if (data) {
          setFormData({
            serviceCategory: data.serviceCategory || 'Carpenter',
            bio: data.bio || '',
            location: data.location || '',
            phoneNumber: data.phoneNumber || '',
            startingPrice: data.startingPrice || '',
            profileImage: data.profileImage || '',
            // Load existing schedule or fall back to defaults
            workingDays: data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workStartTime: data.workStartTime || '08:00',
            workEndTime: data.workEndTime || '17:00',
          });
        }
      } catch (error) {
        console.log("No existing profile found, starting fresh.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Handle Text Inputs
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // 3. Handle Schedule Day Toggles
  const handleDayChange = (day) => {
    setFormData(prev => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day) // Remove if exists
        : [...prev.workingDays, day]; // Add if missing
      return { ...prev, workingDays: days };
    });
  };

  // 4. Handle Image Upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    setImageUploading(true);

    try {
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle both object {url: "..."} and string response
      const validUrl = data.url ? data.url : data;
      
      setFormData((prev) => ({ ...prev, profileImage: validUrl }));
      setImageUploading(false);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error('Image upload failed');
      setImageUploading(false);
    }
  };

  // 5. Submit Form
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/artisan/profile', formData);
      toast.success('Profile saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating profile';
      toast.error(message);
    }
  };

  if (loadingData) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-primary">
            {profileImage ? 'Edit Your Profile' : 'Setup Business Profile'}
          </h1>
          <p className="text-gray-500 mt-2">
            Update your details and schedule so clients can find you.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* --- Image Upload Section --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Profile Picture</label>
            
            {profileImage && (
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-secondary"
              />
            )}

            <input
              type="file"
              onChange={uploadFileHandler}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-secondary hover:file:bg-blue-100"
            />
            {imageUploading && <p className="text-sm text-secondary mt-1">Uploading image... please wait.</p>}
          </div>

          {/* --- Service Category --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">What is your trade?</label>
            <select
              name="serviceCategory"
              value={serviceCategory}
              onChange={onChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
            >
              <option value="Carpenter">Carpenter</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Mason">Mason</option>
              <option value="Painter">Painter</option>
              <option value="Mechanic">Mechanic</option>
            </select>
          </div>

          {/* --- Location --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Location / City</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              placeholder="e.g. Cape Coast"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>

          {/* --- Phone Number --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Business Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={onChange}
              placeholder="054XXXXXXX"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>

          {/* --- Starting Price --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Minimum Service Charge (GHS)</label>
            <input
              type="number"
              name="startingPrice"
              value={startingPrice}
              onChange={onChange}
              placeholder="e.g. 50"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>

          {/* --- Bio --- */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Describe your experience</label>
            <textarea
              name="bio"
              value={bio}
              onChange={onChange}
              rows="4"
              placeholder="I have 5 years of experience fixing..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            ></textarea>
          </div>

          {/* --- NEW: SCHEDULE SECTION --- */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Work Schedule</h3>
            <p className="text-gray-500 text-sm mb-4">Select the days you work and your daily hours. Clients won't be able to book you outside these times.</p>
            
            {/* Days Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayChange(day)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      workingDays.includes(day)
                        ? 'bg-secondary text-white border-secondary shadow-md'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-700 font-bold mb-2">Start Time</label>
                <input
                  type="time"
                  name="workStartTime"
                  value={workStartTime}
                  onChange={onChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 font-bold mb-2">End Time</label>
                <input
                  type="time"
                  name="workEndTime"
                  value={workEndTime}
                  onChange={onChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          </div>
          {/* -------------------------------- */}

          <button
            type="submit"
            disabled={imageUploading}
            className={`w-full text-white font-bold py-4 rounded-lg transition duration-300 text-lg mt-8 ${
              imageUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-blue-600 shadow-lg'
            }`}
          >
            {imageUploading ? 'Waiting for Image...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;