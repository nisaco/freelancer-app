const Review = require('../models/Review');
const ArtisanProfile = require('../models/ArtisanProfile');
const Job = require('../models/Job');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Client Only)
const addReview = async (req, res) => {
  const { artisanId, rating, comment } = req.body;

  try {
    // 1. Check if they actually hired this artisan (Optional security)
    // For now, we will allow open reviews to keep it simple.

    // 2. Create the Review
    await Review.create({
      artisan: artisanId,
      client: req.user.id,
      rating,
      comment
    });

    // 3. Calculate New Average
    const reviews = await Review.find({ artisan: artisanId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    // 4. Update the Artisan's Profile with the new average
    // Note: We need to make sure ArtisanProfile schema has a 'rating' field!
    // We will do that next.
    await ArtisanProfile.findByIdAndUpdate(artisanId, {
        // We will store this dynamically, but for now let's just return success
    });

    res.status(201).json({ message: 'Review added', avgRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Review failed' });
  }
};

// @desc    Get reviews for an artisan
// @route   GET /api/reviews/:artisanId
const getArtisanReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ artisan: req.params.artisanId })
      .populate('client', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

module.exports = { addReview, getArtisanReviews };