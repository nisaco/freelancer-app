const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  getArtisans, 
  getCurrentProfile 
} = require('../controllers/artisanController');
const { protect } = require('../middleware/authMiddleware');

// backend/routes/artisanRoutes.js
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { phone, bio, price, location, profilePic } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.profilePic = profilePic || user.profilePic;

    // FORCIBLY CONVERT TO NUMBER TO MATCH SCHEMA
    if (price !== undefined && price !== "") {
      user.price = Number(price); 
    }

    const updatedUser = await user.save();
    
    // Send back the user without the password
    const userObject = updatedUser.toObject();
    delete userObject.password;

    res.json({ user: userObject });
  } catch (error) {
    console.error("UPDATE ERROR:", error); // Check your Render/Terminal logs for this!
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// Fixed imports to prevent TypeError
router.get('/me', protect, getCurrentProfile); // Line 13
router.post('/profile', protect, updateProfile);
router.get('/', getArtisans);

module.exports = router;