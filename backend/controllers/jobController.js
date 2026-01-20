const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

// @desc    Get all artisans for the Dashboard (Merge Users and Profiles)
// @route   GET /api/jobs/available
exports.getAvailableArtisans = async (req, res) => {
  try {
    // 1. Get all users registered as artisans
    const artisans = await User.find({ role: 'artisan' })
      .select('username profilePic isVerified location category price bio');

    // 2. Fetch all profiles to find matching professional data
    const profiles = await ArtisanProfile.find();

    // 3. Merge data: Priority to Profile, fallback to User model
    const formattedArtisans = artisans.map(user => {
      const profile = profiles.find(p => p.user.toString() === user._id.toString());
      
      return {
        _id: user._id,
        username: user.username,
        category: profile?.serviceCategory || user.category || 'General Artisan',
        bio: profile?.bio || user.bio || 'No bio provided yet.',
        price: profile?.startingPrice || user.price || 0,
        profilePic: profile?.profileImage || user.profilePic,
        isVerified: user.isVerified,
        location: profile?.location || user.location || 'Ghana'
      };
    });

    res.status(200).json(formattedArtisans);
  } catch (error) {
    console.error("Fetch Artisans Error:", error);
    res.status(500).json({ message: 'Error fetching artisans' });
  }
};

// @desc    Create a new job request
exports.createJob = async (req, res) => {
  const { artisanId, serviceType, description, date } = req.body;
  try {
    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType,
      description,
      date: new Date(date)
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job request' });
  }
};

// @desc    Get job history for logged-in user
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ $or: [{ client: req.user.id }, { artisan: req.user.id }] })
      .populate('client', 'username email')
      .populate('artisan', 'username email category profilePic isVerified location');
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job history' });
  }
};

// @desc    Update status (Accept/Decline/Complete)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);
    if (!job || job.artisan.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
    job.status = status;
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed' });
  }
};