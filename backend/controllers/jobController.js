const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Notification = require('../models/Notification');

// @desc    Get all artisans for the Marketplace (Merge Users and Profiles)
// @route   GET /api/jobs/available
exports.getAvailableArtisans = async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' })
      .select('username profilePic isVerified location category price bio rating reviewCount');

    const profiles = await ArtisanProfile.find();

    const formattedArtisans = artisans.map(user => {
      const profile = profiles.find(p => p.user && p.user.toString() === user._id.toString());
      
      return {
        _id: user._id,
        username: user.username,
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

// @desc    Create a new job request
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
      status: 'pending' 
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

// @desc    Update Job Status & Handle Ratings/Notifications
exports.updateJobStatus = async (req, res) => {
  try {
    const { status, rating, comment } = req.body;
    let job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Authorization check
    if (job.artisan.toString() !== req.user.id && job.client.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    job.status = status;

    // --- LOGIC: ARTISAN FINISHED WORK ---
    if (status === 'awaiting_confirmation') {
      await Notification.create({
        recipient: job.client,
        message: `Job Complete! The artisan has finished the task. Please verify and release funds.`,
        type: 'completion'
      });
    }

    // --- LOGIC: CLIENT RELEASES FUNDS & RATES ---
    if (status === 'completed') {
      if (rating) {
        job.rating = rating;
        job.reviewComment = comment || "";
        
        // Update Artisan's Global Rating
        const artisan = await User.findById(job.artisan);
        if (artisan) {
          // Find all completed jobs for this artisan that have a rating
          const ratedJobs = await Job.find({ 
            artisan: job.artisan, 
            status: 'completed', 
            rating: { $exists: true } 
          });

          const totalRatings = ratedJobs.length + 1; // +1 for the current job
          const sumRatings = ratedJobs.reduce((acc, curr) => acc + curr.rating, 0) + Number(rating);
          
          artisan.rating = (sumRatings / totalRatings).toFixed(1);
          artisan.reviewCount = totalRatings;
          await artisan.save();
        }
      }

      await Notification.create({
        recipient: job.artisan,
        message: `Funds Released! Your payment for the ${job.serviceType} job is now in your wallet.`,
        type: 'payment'
      });
    }

    await job.save();
    res.status(200).json(job);

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: 'Status update failed' });
  }
};