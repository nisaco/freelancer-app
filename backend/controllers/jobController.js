const Job = require('../models/Job');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const { createNotification } = require('../utils/notifications');
const { sendWhatsAppJobAlert } = require('../utils/whatsapp');

const ARTISAN_EARNINGS_RATIO = 0.8;

const isSameCalendarDay = (left, right) => {
  if (!left || !right) return false;
  return new Date(left).toDateString() === new Date(right).toDateString();
};

const isGoldActive = (user) => {
  if (!user) return false;
  if (user.subscriptionTier !== 'gold' || user.subscriptionStatus !== 'active') return false;
  if (!user.subscriptionExpiresAt) return true;
  return new Date(user.subscriptionExpiresAt) > new Date();
};

const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

const buildRequestedWindow = (date, scheduledStartAt, scheduledEndAt) => {
  const start = scheduledStartAt ? new Date(scheduledStartAt) : new Date(date);
  const end = scheduledEndAt
    ? new Date(scheduledEndAt)
    : new Date(start.getTime() + (2 * 60 * 60 * 1000)); // default 2-hour slot
  return { start, end };
};

// @desc    Get all artisans for the Marketplace
// @route   GET /api/jobs/available
exports.getAvailableArtisans = async (req, res) => {
  try {
    const { location } = req.query;
    const userQuery = { role: 'artisan' };

    if (location) {
      userQuery.location = { $regex: location, $options: 'i' };
    }

    const artisans = await User.find(userQuery)
      .select('username profilePic isVerified location category price bio workExperience educationBackground educationInstitution educationStatus educationCompletionYear rating reviewCount portfolio subscriptionTier subscriptionStatus subscriptionExpiresAt busySlots');

    const profiles = await ArtisanProfile.find();

    let formattedArtisans = artisans.map((user) => {
      const profile = profiles.find((p) => p.user && p.user.toString() === user._id.toString());
      const gold = isGoldActive(user);

      return {
        _id: user._id,
        username: user.username,
        category: profile?.serviceCategory || user.category || 'General Artisan',
        bio: profile?.bio || user.bio || 'Professional artisan ready to help.',
        workExperience: user.workExperience || '',
        educationBackground: user.educationBackground || '',
        educationInstitution: user.educationInstitution || '',
        educationStatus: user.educationStatus || '',
        educationCompletionYear: user.educationCompletionYear || '',
        price: profile?.startingPrice || user.price || 0,
        profilePic: profile?.profileImage || user.profilePic,
        isVerified: user.isVerified,
        location: profile?.location || user.location || 'Accra, Ghana',
        rating: user.rating || 5,
        reviewCount: user.reviewCount || 0,
        portfolio: profile?.portfolio?.length ? profile.portfolio : (user.portfolio || []),
        subscriptionTier: user.subscriptionTier || 'free',
        isGoldPro: gold,
        busySlots: user.busySlots || []
      };
    });

    if (location) {
      const locationTerm = location.toLowerCase();
      formattedArtisans = formattedArtisans.filter((artisan) =>
        (artisan.location || '').toLowerCase().includes(locationTerm)
      );
    }

    // Gold subscribers rank first, then verified artisans, then best rating.
    formattedArtisans.sort((a, b) => {
      if (a.isGoldPro !== b.isGoldPro) return a.isGoldPro ? -1 : 1;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    res.status(200).json(formattedArtisans);
  } catch (error) {
    console.error("Fetch Artisans Error:", error);
    res.status(500).json({ message: 'Error fetching marketplace data' });
  }
};

// @desc    Featured artisans for homepage
// @route   GET /api/jobs/featured
exports.getFeaturedArtisans = async (req, res) => {
  try {
    const minRating = Number(req.query.minRating || 4.5);
    const minCompletedJobs = Number(req.query.minCompletedJobs || 5);
    const limit = Math.min(Number(req.query.limit || 8), 20);

    const completedJobs = await Job.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$artisan',
          completedJobs: { $sum: 1 }
        }
      },
      { $match: { completedJobs: { $gte: minCompletedJobs } } }
    ]);

    if (!completedJobs.length) {
      return res.json([]);
    }

    const completedMap = new Map(
      completedJobs.map((entry) => [String(entry._id), entry.completedJobs])
    );
    const artisanIds = completedJobs.map((entry) => entry._id);

    const artisans = await User.find({
      _id: { $in: artisanIds },
      role: 'artisan',
      rating: { $gte: minRating }
    }).select('username profilePic isVerified location category price bio workExperience educationBackground educationInstitution educationStatus educationCompletionYear rating reviewCount subscriptionTier subscriptionStatus subscriptionExpiresAt');

    const featured = artisans
      .map((artisan) => ({
        _id: artisan._id,
        username: artisan.username,
        category: artisan.category || 'General Artisan',
        bio: artisan.bio || 'Professional artisan ready to help.',
        workExperience: artisan.workExperience || '',
        educationBackground: artisan.educationBackground || '',
        educationInstitution: artisan.educationInstitution || '',
        educationStatus: artisan.educationStatus || '',
        educationCompletionYear: artisan.educationCompletionYear || '',
        price: artisan.price || 0,
        profilePic: artisan.profilePic,
        isVerified: artisan.isVerified,
        location: artisan.location || 'Accra, Ghana',
        rating: artisan.rating || 0,
        reviewCount: artisan.reviewCount || 0,
        completedJobs: completedMap.get(String(artisan._id)) || 0,
        subscriptionTier: artisan.subscriptionTier || 'free',
        isGoldPro: isGoldActive(artisan)
      }))
      .sort((a, b) => {
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        if ((b.completedJobs || 0) !== (a.completedJobs || 0)) return (b.completedJobs || 0) - (a.completedJobs || 0);
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      })
      .slice(0, limit);

    res.json(featured);
  } catch (error) {
    console.error("Featured Artisans Error:", error);
    res.status(500).json({ message: 'Failed to fetch featured artisans' });
  }
};

// @desc    Track profile view and return artisan profile
// @route   GET /api/jobs/artisan/:id
exports.getArtisanProfile = async (req, res) => {
  try {
    const artisan = await User.findOne({ _id: req.params.id, role: 'artisan' })
      .select('username profilePic isVerified location category price bio workExperience educationBackground educationInstitution educationStatus educationCompletionYear rating reviewCount portfolio subscriptionTier subscriptionStatus subscriptionExpiresAt profileViewsTotal profileViewsToday profileViewsDate busySlots');

    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    const now = new Date();
    if (isSameCalendarDay(artisan.profileViewsDate, now)) {
      artisan.profileViewsToday = (artisan.profileViewsToday || 0) + 1;
    } else {
      artisan.profileViewsToday = 1;
      artisan.profileViewsDate = now;
    }
    artisan.profileViewsTotal = (artisan.profileViewsTotal || 0) + 1;
    await artisan.save();

    res.status(200).json({
      _id: artisan._id,
      username: artisan.username,
      category: artisan.category || 'General Artisan',
      bio: artisan.bio || 'Professional artisan ready to help.',
      workExperience: artisan.workExperience || '',
      educationBackground: artisan.educationBackground || '',
      educationInstitution: artisan.educationInstitution || '',
      educationStatus: artisan.educationStatus || '',
      educationCompletionYear: artisan.educationCompletionYear || '',
      price: artisan.price || 0,
      profilePic: artisan.profilePic,
      isVerified: artisan.isVerified,
      location: artisan.location || 'Accra, Ghana',
      rating: artisan.rating || 5,
      reviewCount: artisan.reviewCount || 0,
      portfolio: artisan.portfolio || [],
      subscriptionTier: artisan.subscriptionTier || 'free',
      isGoldPro: isGoldActive(artisan),
      busySlots: artisan.busySlots || []
    });
  } catch (error) {
    console.error("Get Artisan Profile Error:", error);
    res.status(500).json({ message: 'Failed to fetch artisan profile' });
  }
};

// @desc    Get availability calendar for an artisan
// @route   GET /api/jobs/artisan/:id/availability
exports.getArtisanAvailability = async (req, res) => {
  try {
    const artisan = await User.findOne({ _id: req.params.id, role: 'artisan' })
      .select('busySlots username');

    if (!artisan) return res.status(404).json({ message: 'Artisan not found' });

    const now = new Date();
    const upcomingBusySlots = (artisan.busySlots || [])
      .filter((slot) => new Date(slot.end) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    res.json({
      artisanId: artisan._id,
      artisanName: artisan.username,
      busySlots: upcomingBusySlots
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load artisan availability' });
  }
};

// @desc    Artisan updates busy slots calendar
// @route   PUT /api/jobs/artisan/availability/me
exports.updateMyAvailability = async (req, res) => {
  try {
    const { busySlots } = req.body;
    if (!Array.isArray(busySlots)) {
      return res.status(400).json({ message: 'busySlots must be an array' });
    }

    const normalized = busySlots
      .map((slot) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
        note: slot.note || '',
        location: slot.location || ''
      }))
      .filter((slot) => !Number.isNaN(slot.start.getTime()) && !Number.isNaN(slot.end.getTime()) && slot.start < slot.end)
      .sort((a, b) => a.start - b.start);

    const artisan = await User.findOne({ _id: req.user._id, role: 'artisan' });
    if (!artisan) return res.status(404).json({ message: 'Artisan account not found' });

    artisan.busySlots = normalized;
    await artisan.save();

    res.json({ message: 'Availability updated', busySlots: artisan.busySlots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update availability' });
  }
};

// @desc    Artisan business analytics
// @route   GET /api/jobs/artisan/analytics/me
exports.getArtisanAnalytics = async (req, res) => {
  try {
    const artisanId = req.user._id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [completedThisMonth, completedCount, cancelledCount, artisan] = await Promise.all([
      Job.aggregate([
        {
          $match: {
            artisan: artisanId,
            status: 'completed',
            completedAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Job.countDocuments({ artisan: artisanId, status: 'completed' }),
      Job.countDocuments({ artisan: artisanId, status: 'cancelled' }),
      User.findById(artisanId).select('profileViewsToday profileViewsDate subscriptionTier subscriptionStatus subscriptionExpiresAt')
    ]);

    const monthlyGross = completedThisMonth[0]?.total || 0;
    const totalEarnedThisMonth = Number((monthlyGross * ARTISAN_EARNINGS_RATIO).toFixed(2));
    const closedJobs = completedCount + cancelledCount;
    const successRate = closedJobs ? Number(((completedCount / closedJobs) * 100).toFixed(1)) : 0;
    const profileViewsToday = isSameCalendarDay(artisan?.profileViewsDate, now) ? (artisan?.profileViewsToday || 0) : 0;

    res.json({
      totalEarnedThisMonth,
      profileViewsToday,
      successRate,
      completedJobs: completedCount,
      cancelledJobs: cancelledCount,
      subscriptionTier: artisan?.subscriptionTier || 'free',
      subscriptionStatus: artisan?.subscriptionStatus || 'inactive',
      subscriptionExpiresAt: artisan?.subscriptionExpiresAt || null,
      isGoldPro: isGoldActive(artisan)
    });
  } catch (error) {
    console.error("Artisan Analytics Error:", error);
    res.status(500).json({ message: 'Failed to fetch artisan analytics' });
  }
};

// @desc    Create a new job request
exports.createJob = async (req, res) => {
  const { artisanId, serviceType, description, date, amount, scheduledStartAt, scheduledEndAt } = req.body;
  try {
    const artisan = await User.findOne({ _id: artisanId, role: 'artisan' }).select('busySlots phone whatsappPhone whatsappOptIn location');
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    const { start, end } = buildRequestedWindow(date, scheduledStartAt, scheduledEndAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: 'Invalid scheduling window' });
    }

    const hasConflict = (artisan.busySlots || []).some((slot) => {
      const busyStart = new Date(slot.start);
      const busyEnd = new Date(slot.end);
      return overlaps(start, end, busyStart, busyEnd);
    });

    if (hasConflict) {
      return res.status(409).json({
        message: 'Selected artisan is not available in the requested time window. Please choose another slot.'
      });
    }

    const job = await Job.create({
      client: req.user.id,
      artisan: artisanId,
      serviceType: serviceType || 'General Service',
      description,
      amount: amount || 0,
      date: new Date(date),
      scheduledStartAt: start,
      scheduledEndAt: end,
      status: 'pending'
    });

    await createNotification({
      recipient: artisanId,
      type: 'NEW_BOOKING',
      relatedId: job._id,
      message: `New job request for ${serviceType || 'General Service'}.`
    });

    const whatsappPhone = artisan.whatsappPhone || artisan.phone;
    if (artisan.whatsappOptIn !== false && whatsappPhone) {
      await sendWhatsAppJobAlert({
        phone: whatsappPhone,
        serviceType: serviceType || 'General Service',
        location: artisan.location || ''
      });
    }

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
    const { status, rating, comment, reviewComment } = req.body;
    const feedback = reviewComment || comment || "";
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.artisan.toString() !== req.user.id && job.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    job.status = status;

    if (status === 'awaiting_confirmation') {
      await createNotification({
        recipient: job.client,
        message: 'Job complete. Confirm delivery to release escrow funds.',
        type: 'JOB_COMPLETED',
        relatedId: job._id
      });
    }

    if (status === 'completed') {
      job.completedAt = job.completedAt || new Date();
      job.escrowReleasedAt = new Date();

      if (rating) {
        job.rating = Number(rating);
        job.reviewComment = feedback;
      }

      const artisan = await User.findById(job.artisan);
      if (artisan && rating) {
        const ratedJobs = await Job.find({
          artisan: job.artisan,
          status: 'completed',
          rating: { $exists: true }
        }).select('rating');

        const totalRatings = ratedJobs.length;
        const sumRatings = ratedJobs.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);

        artisan.rating = totalRatings ? Number((sumRatings / totalRatings).toFixed(1)) : artisan.rating;
        artisan.reviewCount = totalRatings;
        await artisan.save();
      }

      await createNotification({
        recipient: job.artisan,
        message: `Escrow released for ${job.serviceType}. Funds are now available in wallet.`,
        type: 'PAYMENT_RECEIVED',
        relatedId: job._id
      });
    }

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: 'Status update failed' });
  }
};

// @desc    Generate PDF invoice/receipt for completed jobs
// @route   GET /api/jobs/:id/invoice
exports.downloadInvoice = async (req, res) => {
  try {
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (error) {
      return res.status(500).json({ message: 'PDF support is not installed on the server yet.' });
    }

    const job = await Job.findById(req.params.id)
      .populate('client', 'username email')
      .populate('artisan', 'username email category');

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Invoice is only available for completed jobs' });
    }

    const requesterId = req.user?._id?.toString();
    const isOwner = requesterId &&
      (job.client?._id?.toString() === requesterId || job.artisan?._id?.toString() === requesterId);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

    if (!job.invoiceNumber) {
      const stamp = Date.now().toString().slice(-6);
      job.invoiceNumber = `INV-${new Date().getFullYear()}-${stamp}`;
      job.invoiceIssuedAt = new Date();
      await job.save();
    }

    const gross = Number(job.amount || 0);
    const artisanShare = Number((gross * ARTISAN_EARNINGS_RATIO).toFixed(2));
    const platformFee = Number((gross - artisanShare).toFixed(2));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${job.invoiceNumber}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('LinkUp Invoice Receipt', { align: 'left' });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Invoice #: ${job.invoiceNumber}`);
    doc.text(`Issued: ${new Date(job.invoiceIssuedAt || new Date()).toLocaleString()}`);
    doc.text(`Completed: ${new Date(job.completedAt || job.updatedAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Client', { underline: true });
    doc.fontSize(11).text(`${job.client?.username || 'Client'}`);
    doc.text(`${job.client?.email || '-'}`);
    doc.moveDown();

    doc.fontSize(12).text('Artisan', { underline: true });
    doc.fontSize(11).text(`${job.artisan?.username || 'Artisan'}`);
    doc.text(`${job.artisan?.email || '-'}`);
    doc.text(`${job.artisan?.category || 'General Service'}`);
    doc.moveDown();

    doc.fontSize(12).text('Job Details', { underline: true });
    doc.fontSize(11).text(`Service: ${job.serviceType || 'General Service'}`);
    doc.text(`Description: ${job.description || '-'}`);
    doc.text(`Service Date: ${new Date(job.date).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Payment Breakdown', { underline: true });
    doc.fontSize(11).text(`Gross Amount: GHS ${gross.toFixed(2)}`);
    doc.text(`Artisan Share (80%): GHS ${artisanShare.toFixed(2)}`);
    doc.text(`Platform Fee: GHS ${platformFee.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(10).fillColor('#444').text('Escrow policy: funds are released only after client confirmation.');
    doc.text('Conduct policy: off-platform payments are prohibited for trust and audit protection.');

    doc.end();
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};

// @desc    Get reviews for a specific artisan
exports.getArtisanReviews = async (req, res) => {
  try {
    const reviews = await Job.find({
      artisan: req.params.id,
      status: 'completed',
      rating: { $exists: true }
    }).populate('client', 'username profilePic');

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching reviews" });
  }
};

// @desc    Complete job and add review
exports.completeJob = async (req, res) => {
  try {
    const { rating, reviewComment } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = 'completed';
    job.completedAt = new Date();
    job.escrowReleasedAt = new Date();
    job.rating = rating;
    job.reviewComment = reviewComment;

    await job.save();
    res.status(200).json({ message: "Job finalized with review" });
  } catch (error) {
    res.status(500).json({ message: "Server error finalizing job" });
  }
};

