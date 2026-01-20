const ArtisanProfile = require('../models/ArtisanProfile');
const User = require('../models/User');

const updateProfile = async (req, res) => {
  const { serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime } = req.body;
  const profileFields = { user: req.user.id, serviceCategory, bio, location, phoneNumber, startingPrice, profileImage, workingDays, workStartTime, workEndTime };
  try {
    let profile = await ArtisanProfile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true, upsert: true });
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const getArtisans = async (req, res) => {
  try {
    const profiles = await ArtisanProfile.find(req.query.category ? { serviceCategory: req.query.category } : {}).populate('user', 'username email isVerified');
    res.json(profiles);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const getCurrentProfile = async (req, res) => {
  try {
    // Pull fresh 'isVerified' status from the User model
    const profile = await ArtisanProfile.findOne({ user: req.user.id }).populate('user', 'username email isVerified');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

module.exports = { updateProfile, getArtisans, getCurrentProfile };