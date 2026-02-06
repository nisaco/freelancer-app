const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');

// @desc    Get all artisans for the Marketplace (Merge Users and Profiles)
// @route   GET /api/jobs/available
exports.getAvailableArtisans = async (req, res) => {
  try {
    // 1. Get all users registered as artisans
    const artisans = await User.find({ role: 'artisan' })
      .select('username profilePic isVerified location category price bio rating reviewCount');

    // 2. Fetch professional profiles
    const profiles = await ArtisanProfile.find();

    // 3. Merge data: Priority to ArtisanProfile, fallback to User model
    const formattedArtisans = artisans.map(user => {
      const profile = profiles.find(p => p.user && p.user.toString() === user._id.toString());
      
      return {
        _id: user._id,
        username: user.username,
        // If profile exists, use its category, else use user model, else default
        category: profile?.serviceCategory || user.category || 'General Artisan',
        bio: profile?.bio || user.bio || 'Professional artisan ready to help.',
        price: profile?.startingPrice || user.price || 0,
        profilePic: profile?.profileImage || user.profilePic,
        isVerified: user.isVerified,
        location: profile?.location || user.location || 'Accra, Ghana',
        rating: user.rating || 5,
        reviewCount: user.reviewCount || 0
      };
    });

    res.status(200).json(formattedArtisans);
  } catch (error) {
    console.error("Fetch Artisans Error:", error);
    res.status(500).json({ message: 'Error fetching marketplace data' });
  }
};

// @desc    Create a new job request (Called after Paystack initialization)
exports.createJob = async (req, res) => {
  const { artisanId, serviceType, description, date, amount } = req.body;
  try {
    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType || 'General Service',
      description,
      amount: amount || 0,
      date: new Date(date),
      status: 'pending' // Usually set to 'paid' after Paystack webhook
    });
    res.status(201).json(job);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: 'Failed to create job request' });
  }
};

// @desc    Universal Job History
exports.getMyJobs = async (req, res) => {
  try {
    // Finds jobs where user is either the client or the artisan
    const jobs = await Job.find({ 
      $or: [{ client: req.user.id }, { artisan: req.user.id }] 
    })
    .populate('client', 'username email')
    .populate('artisan', 'username category profilePic isVerified location phone')
    .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job history' });
  }
};

// @desc    Legacy Status Update (Standard logic)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Authorization check
    if (job.artisan.toString() !== req.user.id && job.client.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    job.status = status;
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed' });
  }

  // When Artisan marks job as 'awaiting_confirmation'
if (status === 'awaiting_confirmation') {
  await Notification.create({
    recipient: job.client, // Notify the Client
    message: `Job Complete! ${user.username} has finished the task. Please verify and release funds.`,
    type: 'completion'
  });
}

// When Client marks job as 'completed' (Releasing funds)
if (status === 'completed') {
  await Notification.create({
    recipient: job.artisan, // Notify the Artisan
    message: `Funds Released! Your payment for the ${job.category} job is now in your wallet.`,
    type: 'payment'
  });
}
};