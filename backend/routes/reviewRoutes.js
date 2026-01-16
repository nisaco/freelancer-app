const express = require('express');
const router = express.Router();
const { addReview, getArtisanReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/:artisanId', getArtisanReviews);

module.exports = router;