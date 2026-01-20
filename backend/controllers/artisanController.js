const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Create or Update Artisan Profile
// @route   POST /api/artisan/profile
exports.updateProfile = async (req, res) => {
  const { serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime } = req.body;
  const profileFields = { user: req.user.id, serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime };
  try {
    let profile = await ArtisanProfile.findOneAndUpdate(
      { user: req.user.id }, 
      { $set: profileFields }, 
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get all artisans
// @route   GET /api/artisan
exports.getArtisans = async (req, res) => {
  try {
    const profiles = await ArtisanProfile.find(req.query.category ? { serviceCategory: req.query.category } : {}).populate('user', 'username email isVerified');
    res.json(profiles);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get current logged-in artisan's profile
// @route   GET /api/artisan/me
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user.id }).populate('user', 'username email isVerified');
    
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
    res.status(500).send('Server Error');
  }
};