const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

// @desc    Get current logged-in artisan's profile with LIVE verification status
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user.id })
      .populate('user', 'username email isVerified');

    // Fallback: If no profile exists, still return the user's verification status
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

// Keep updateProfile and getArtisans using named exports
exports.updateProfile = async (req, res) => {
  const { serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime } = req.body;
  try {
    let profile = await ArtisanProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { user: req.user.id, serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime } },
      { new: true, upsert: true }
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