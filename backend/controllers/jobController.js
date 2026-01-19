const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get all artisans for the Dashboard (Verified first)
// @route   GET /api/jobs/available
// @access  Private
exports.getAvailableArtisans = async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' })
      .select('username category bio price profilePic isVerified location') // Explicitly leave out ghanaCard details
      .sort({ isVerified: -1, createdAt: -1 });

    res.status(200).json(artisans);
  } catch (error) {
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
      return res.status(400).json({ message: 'This artisan is already booked at this time.' });
    }

    // 3. Create Job
    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType || artisan.category,
      description,
      date
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

// @desc    Get jobs for the logged-in user
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [{ client: req.user.id }, { artisan: req.user.id }]
    })
    .populate('client', 'username email')
    .populate('artisan', 'username email category profilePic isVerified')
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// @desc    Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.artisan.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    job.status = status;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};