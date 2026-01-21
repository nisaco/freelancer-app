const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Get current logged-in artisan's profile
// @route   GET /api/artisan/me
exports.getCurrentProfile = async (req, res) => {
  try {
    // 1. Try to find the professional profile
    const profile = await ArtisanProfile.findOne({ user: req.user.id })
      .populate('user', 'username email isVerified role');

    // 2. If NO profile exists, don't 404. Send a partial object instead.
    if (!profile) {
      const user = await User.findById(req.user.id).select('username email isVerified role');
      return res.json({
        user: user,
        isNewArtisan: true, // Flag for the frontend
        serviceCategory: '',
        bio: '',
        startingPrice: 0,
        location: user.location || ''
      });
    }

    // 3. If it exists, send the full profile
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update or Create Profile
exports.updateProfile = async (req, res) => {
  const { 
    serviceCategory, bio, location, phoneNumber, startingPrice, profileImage,
    workingDays, workStartTime, workEndTime 
  } = req.body;

  try {
    const profileFields = {
      user: req.user.id,
      serviceCategory,
      bio,
      location,
      phoneNumber,
      startingPrice,
      profileImage,
      workingDays,
      workStartTime,
      workEndTime
    };

    let profile = await ArtisanProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true } // Creates it if it doesn't exist
    );
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};