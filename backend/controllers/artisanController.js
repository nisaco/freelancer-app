const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Create or Update Artisan Profile
// @route   POST /api/artisan/profile
// @access  Private (Logged in Artisan only)
const updateProfile = async (req, res) => {

  // --- ADD THESE LOGS ---
  console.log("--------------------------------");
  console.log("INCOMING DATA FROM FRONTEND:");
  console.log(req.body); 
  console.log("--------------------------------");
const { 
    serviceCategory, bio, location, phoneNumber, startingPrice, profileImage,
    workingDays, workStartTime, workEndTime // <--- ADD THESE
  } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id, // This comes from the middleware
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
    // Check if profile already exists for this user
    let profile = await ArtisanProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await ArtisanProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create new profile if none exists
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
// @access  Public (Anyone can see)
const getArtisans = async (req, res) => {
  try {
    const { category } = req.query; // e.g. /api/artisan?category=Plumber
    
    let query = {};
    if (category) {
      query.serviceCategory = category;
    }

    // Find profiles and attach the User's name and email
    const profiles = await ArtisanProfile.find(query).populate('user', 'username email');

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
    // Find the profile linked to the logged-in user's ID
    const profile = await ArtisanProfile.findOne({ user: req.user.id }).populate('user', 'username email');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// EXPORT ALL FUNCTIONS HERE
module.exports = {
  updateProfile,
  getArtisans,
  getCurrentProfile
};