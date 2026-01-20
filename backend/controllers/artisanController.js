const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Get current logged-in artisan's profile with LIVE verification status
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user.id })
      .populate('user', 'username email isVerified');

    // If no profile exists yet, return a skeleton object so the frontend doesn't crash
    if (!profile) {
      const user = await User.findById(req.user.id).select('username email isVerified');
      return res.json({
        user: user,
        serviceCategory: '',
        bio: '',
        startingPrice: 0
      });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// ... keep updateProfile and getArtisans the same ...