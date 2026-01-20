const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

// @desc    Get all artisans for the Dashboard
// @route   GET /api/jobs/available
// @access  Private
exports.getAvailableArtisans = async (req, res) => {
  try {
    const profiles = await ArtisanProfile.find()
      .populate('user', 'username profilePic isVerified location');

    const artisans = profiles.map(profile => ({
      _id: profile.user ? profile.user._id : profile._id,
      username: profile.user ? profile.user.username : 'Expert Artisan',
      category: profile.serviceCategory, 
      bio: profile.bio,
      price: profile.startingPrice,
      profilePic: profile.profileImage,
      isVerified: profile.user ? profile.user.isVerified : false,
      location: profile.location
    }));

    res.status(200).json(artisans);
  } catch (error) {
    console.error("Fetch Artisans Error:", error);
    res.status(500).json({ message: 'Error fetching artisans' });
  }
};

// @desc    Create a new job request
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  const { artisanId, serviceType, description, date } = req.body;
  try {
    const requestedDate = new Date(date);
    const artisan = await User.findById(artisanId);
    
    if (!artisan || artisan.role !== 'artisan') {
        return res.status(404).json({ message: 'Artisan not found' });
    }

    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType || artisan.category,
      description,
      date: requestedDate
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job request' });
  }
};

// @desc    Get jobs for the logged-in user
// @route   GET /api/jobs/my-jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
        $or: [{ client: req.user.id }, { artisan: req.user.id }] 
    })
    .populate('client', 'username email')
    .populate('artisan', 'username email category profilePic isVerified location');
    
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job history' });
  }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);
    
    if (!job || job.artisan.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    job.status = status;
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed' });
  }
};