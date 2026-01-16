const Job = require('../models/Job');

// @desc    Create a new job request (With Conflict Check)
// @route   POST /api/jobs
// @access  Private (Client only)
// Don't forget to import ArtisanProfile at the top!
const ArtisanProfile = require('../models/ArtisanProfile');

const createJob = async (req, res) => {
  const { artisanId, serviceType, description, date } = req.body;

  try {
    const requestedDate = new Date(date);

    // 1. FETCH THE ARTISAN'S PROFILE (To get their specific schedule)
    // We search by 'user' because artisanId is the User ID
    const artisanProfile = await ArtisanProfile.findOne({ user: artisanId });
    
    if (!artisanProfile) {
      return res.status(404).json({ message: 'Artisan profile not found' });
    }

    // 2. CHECK WORKING DAYS
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const requestDayName = daysMap[requestedDate.getDay()]; // e.g., "Monday"

    if (!artisanProfile.workingDays.includes(requestDayName)) {
      return res.status(400).json({ 
        message: `This artisan does not work on ${requestDayName}s.` 
      });
    }

    // 3. CHECK WORKING HOURS
    // Convert times to simple numbers for comparison (e.g., "09:30" -> 9.5)
    const getDecimalTime = (dateObj) => dateObj.getHours() + dateObj.getMinutes() / 60;
    const getDecimalString = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h + m / 60;
    };

    const requestTime = getDecimalTime(requestedDate);
    const startTime = getDecimalString(artisanProfile.workStartTime);
    const endTime = getDecimalString(artisanProfile.workEndTime);

    if (requestTime < startTime || requestTime >= endTime) {
      return res.status(400).json({ 
        message: `This artisan only works between ${artisanProfile.workStartTime} and ${artisanProfile.workEndTime}.` 
      });
    }

    // 4. DOUBLE BOOKING CHECK (Existing logic)
    const conflict = await Job.findOne({
      artisan: artisanId,
      date: requestedDate,
      status: { $ne: 'rejected' }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This artisan is already booked at this time.' });
    }

    // 5. Create Job
    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType,
      description,
      date
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

// @desc    Get jobs for the logged-in user
// @route   GET /api/jobs
// @access  Private
const getMyJobs = async (req, res) => {
  try {
    // Find jobs where the user is EITHER the client OR the artisan
    const jobs = await Job.find({
      $or: [{ client: req.user.id }, { artisan: req.user.id }]
    })
    .populate('client', 'username email') // Attach client details
    .populate('artisan', 'username email') // Attach artisan details
    .sort({ createdAt: -1 }); // Newest first

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// @desc    Update job status (Accept/Reject/Complete)
// @route   PUT /api/jobs/:id
// @access  Private (Artisan only)
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g. "accepted", "rejected", "completed"
    
    // Find the job
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Security Check: Only the assigned Artisan can update the status
    if (job.artisan.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job.status = status;
    await job.save();

    // Re-fetch with populated fields so the frontend gets the client info immediately
    const updatedJob = await Job.findById(req.params.id)
      .populate('client', 'username email')
      .populate('artisan', 'username email');

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

// CRITICAL: Ensure all 3 functions are exported here!
module.exports = { createJob, getMyJobs, updateJobStatus };