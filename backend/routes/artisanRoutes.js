const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Update Artisan Profile
// @route   PUT /api/artisan/update-profile
// @access  Private (Artisan only)
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { phone, bio, price, location, profilePic } = req.body;

    // 1. Ensure price is handled as a number to prevent Schema 'CastError'
    const numericPrice = price === "" ? 0 : Number(price);

    // 2. Update only the allowed fields defined in your User.js
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          phone: phone || "", 
          bio: bio || "", 
          location: location || "", 
          profilePic: profilePic || "",
          price: numericPrice
        } 
      },
      { new: true, runValidators: true } // 'new' returns the updated doc
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile Update Error:", error.message);
    res.status(500).json({ 
      message: "Database update failed", 
      error: error.message 
    });
  }
});

module.exports = router;