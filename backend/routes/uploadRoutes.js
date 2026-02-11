const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

// This route handles the Artisan Profile Setup with 2 images
router.put('/profile-setup', protect, authorize('artisan'), upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'ghanaCardImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { category, price, location, bio, ghanaCardNumber } = req.body;
    
    // Get the URLs from Cloudinary (provided by multer)
    const profilePicUrl = req.files['profilePic'] ? req.files['profilePic'][0].path : undefined;
    const ghanaCardUrl = req.files['ghanaCardImage'] ? req.files['ghanaCardImage'][0].path : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(category ? { category } : {}),
        ...(price ? { price } : {}),
        ...(location ? { location } : {}),
        ...(bio ? { bio } : {}),
        ...(ghanaCardNumber ? { ghanaCardNumber } : {}),
        ...(profilePicUrl ? { profilePic: profilePicUrl } : {}),
        ...(ghanaCardUrl ? { ghanaCardImage: ghanaCardUrl } : {}),
        isPending: true,
        isVerified: false
      },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
