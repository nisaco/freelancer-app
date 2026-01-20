const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

// @desc    Get all artisans for the Dashboard (Verified first, but shows all)
// @route   GET /api/jobs/available
// @access  Private
exports.getAvailableArtisans = async (req, res) => {
  try {
    // 1. Fetch from ArtisanProfile to get category, price, and bio
    // 2. Populate the 'user' field to get username and verification status
    const profiles = await ArtisanProfile.find()
      .populate('user', 'username profilePic isVerified location')
      .sort({ createdAt: -1 });

    // 3. Format the data to match what Dashboard.jsx and JobItem.jsx expect
    const artisans = profiles.map(profile => ({
      _id: profile.user ? profile.user._id : profile._id,
      username: profile.user ? profile.user.username : 'Unknown Artisan',
      category: profile.serviceCategory, // Mapping serviceCategory to category
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
// @access  Private (Client only)
exports.createJob = async (req, res) => {
  const { artisanId, serviceType, description, date } = req.body;

  try {
    const requestedDate = new Date(date);

    // 1. Fetch Artisan Details
    const artisan = await User.findById(artisanId);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    // 2. Conflict Check (Double Booking)
    const conflict = await Job.findOne({
      artisan: artisanId,
      date: requestedDate,
      status: { $ne: 'rejected' }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This artisan is already booked for this time slot.' });
    }

    // 3. Create Job
    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType || artisan.category,
      description,
      date: requestedDate
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Create Job Error:", error);
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
    .populate('artisan', 'username email category profilePic isVerified location')
    .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Get My Jobs Error:", error);
    res.status(500).json({ message: 'Failed to fetch your job history' });
  }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id
// @access  Private (Artisan only)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.artisan.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job.status = status;
    await job.save();

    res.status(200).json(job);
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(500).json({ message: 'Status update failed' });
  }
};