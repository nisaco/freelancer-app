const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

// @desc    Get all artisans for the Dashboard (Cross-referencing Users and Profiles)
// @route   GET /api/jobs/available
exports.getAvailableArtisans = async (req, res) => {
  try {
    // 1. Get all users who are registered as artisans
    const artisans = await User.find({ role: 'artisan' })
      .select('username profilePic isVerified location category price bio');

    // 2. Get all existing profiles to merge data
    const profiles = await ArtisanProfile.find();

    // 3. Merge data: Use Profile data if it exists, otherwise fallback to User data
    const formattedArtisans = artisans.map(user => {
      const profile = profiles.find(p => p.user.toString() === user._id.toString());
      
      return {
        _id: user._id,
        username: user.username,
        // Fallback logic: Priority to Profile, then User, then Default
        category: profile?.serviceCategory || user.category || 'General Artisan',
        bio: profile?.bio || user.bio || 'No bio provided yet.',
        price: profile?.startingPrice || user.price || 0,
        profilePic: profile?.profileImage || user.profilePic,
        isVerified: user.isVerified, // Always take verification from User model
        location: profile?.location || user.location || 'Ghana'
      };
    });

    res.status(200).json(formattedArtisans);
  } catch (error) {
    console.error("Fetch Artisans Error:", error);
    res.status(500).json({ message: 'Error fetching artisans' });
  }
};

// ... keep other exports (createJob, getMyJobs, updateJobStatus) the same ...