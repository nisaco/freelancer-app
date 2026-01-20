const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Create or Update Artisan Profile
// @route   POST /api/artisan/profile
// @access  Private (Logged in Artisan only)
const updateProfile = async (req, res) => {
  const { 
    serviceCategory, bio, location, phoneNumber, startingPrice, profileImage,
    workingDays, workStartTime, workEndTime 
  } = req.body;

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

  try {
    let profile = await ArtisanProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await ArtisanProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    profile = new ArtisanProfile(profileFields);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all artisans (or filter by category)
// @route   GET /api/artisan
const getArtisans = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.serviceCategory = category;
    }

    const profiles = await ArtisanProfile.find(query).populate('user', 'username email isVerified');
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get current logged-in artisan's profile
// @route   GET /api/artisan/me
// @access  Private
const getCurrentProfile = async (req, res) => {
  try {
    // FIX: Populate 'user' to ensure we get the latest 'isVerified' status from DB
    const profile = await ArtisanProfile.findOne({ user: req.user.id })
      .populate('user', 'username email isVerified');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  updateProfile,
  getArtisans,
  getCurrentProfile
};