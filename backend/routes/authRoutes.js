const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary'); // Importing your existing code
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  handleOnboarding 
} = require('../controllers/authController');

// --- ROUTES ---

// 1. Update Profile Photo (Instant Upload)
// Uses your existing 'upload' middleware which handles Cloudinary
router.post('/update-photo', protect, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // With your cloudinary.js setup, req.file.path is the Cloudinary URL
    user.profilePic = req.file.path; 
    await user.save();

    res.status(200).json({ 
      message: "Profile photo updated", 
      profilePic: user.profilePic 
    });
  } catch (err) {
    console.error("Cloudinary Error:", err);
    res.status(500).json({ message: "Cloud upload failed" });
  }
});

// 2. Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 3. Private Routes
router.get('/profile', protect, getProfile);

// 4. Onboarding (Handling multiple files)
router.post('/onboarding', protect, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'ghanaCard', maxCount: 1 }
]), handleOnboarding);

module.exports = router;