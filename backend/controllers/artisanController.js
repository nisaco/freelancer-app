const User = require('../models/User');

// @desc    Update Artisan Profile (Saves directly to User model)
// @route   POST /api/artisan/profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      serviceCategory, bio, location, startingPrice, ghanaCardNumber 
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          category: serviceCategory,
          bio,
          location,
          price: startingPrice,
          ghanaCardNumber,
          isPending: true // Mark as awaiting admin approval
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all artisans for marketplace
exports.getArtisans = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { role: 'artisan' };
    if (category) query.category = category;

    const artisans = await User.find(query).select('-password');
    res.json(artisans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current logged-in user (Source of truth for Dashboard)
exports.getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Artisan Profile (Excludes identity documents)
// @route   PATCH /api/artisan/profile/edit
exports.editProfile = async (req, res) => {
  const { serviceCategory, bio, location, phoneNumber, startingPrice } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          category: serviceCategory,
          bio,
          location,
          phoneNumber,
          price: startingPrice
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};