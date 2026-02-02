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

    if (user) {
      // Direct alignment with User.js Schema
      user.phone = phone || user.phone;
      user.bio = bio || user.bio;
      user.price = price !== undefined ? price : user.price;
      user.location = location || user.location;
      user.profilePic = profilePic || user.profilePic;
      
      const updatedUser = await user.save();
      
      // Return everything EXCEPT password
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json({
        message: "Profile updated",
        user: userResponse
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// Fixed imports to prevent TypeError
router.get('/me', protect, getCurrentProfile); // Line 13
router.post('/profile', protect, updateProfile);
router.get('/', getArtisans);

module.exports = router;