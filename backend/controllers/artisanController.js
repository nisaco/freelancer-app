const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Get current logged-in artisan's profile
// @route   GET /api/artisan/me
exports.getCurrentProfile = async (req, res) => {
  try {
    // 1. Look for the professional profile and pull live User data (for verification status)
    const profile = await ArtisanProfile.findOne({ user: req.user.id })
      .populate('user', 'username email isVerified role');

    // 2. If NO profile exists in the database, send the skeleton object
    if (!profile) {
      const user = await User.findById(req.user.id).select('username email isVerified role');
      return res.json({
        user: user,
        isNewArtisan: true, // This tells the dashboard to show the setup prompt
        serviceCategory: '',
        bio: '',
        startingPrice: 0
      });
    }

    // 3. If it exists, send the full profile (Standard Dashboard View)
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update or Create Profile
exports.updateProfile = async (req, res) => {
  const { serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime } = req.body;
  try {
    const profileFields = { user: req.user.id, serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime };
    let profile = await ArtisanProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true } // This creates the document so the user is no longer "New"
    );
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getArtisans = async (req, res) => {
  try {
    const profiles = await ArtisanProfile.find(req.query.category ? { serviceCategory: req.query.category } : {}).populate('user', 'username email isVerified');
    res.json(profiles);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};