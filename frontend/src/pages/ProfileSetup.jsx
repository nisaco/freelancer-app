// ... existing imports ...

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const finalCategory = isOther ? formData.customCategory : formData.category;

  // IMPORTANT: We use a simple object if not uploading actual files yet, 
  // or FormData if you are. Let's stick to the structure your controller expects.
  const profileData = {
    category: finalCategory,
    location: formData.location,
    bio: formData.bio,
    price: formData.price,
    ghanaCardNumber: formData.ghanaCardNumber
  };

  try {
    const token = localStorage.getItem('token');
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/artisan/profile' 
      : 'https://hireme-bk0l.onrender.com/api/artisan/profile';

    const response = await axios.post(API_URL, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // --- FIX: Update LocalStorage with the FRESH user from the server ---
    // This prevents the username from turning into "Guest"
    localStorage.setItem('user', JSON.stringify(response.data));

    toast.success("Profile submitted successfully!");
    navigate('/artisan-dashboard');
    
  } catch (err) {
    console.error(err);
    toast.error("Failed to update profile.");
  } finally {
    setLoading(false);
  }
};