const User = require('../models/User');

// @desc    Update Artisan Profile (Saves directly to User model)
// @route   POST /api/artisan/profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      category, bio, location, price, ghanaCardNumber 
    } = req.body;

    // We update the User document directly
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          category,
          bio,
          location,
          price,
          ghanaCardNumber,
          isPending: true // Mark as awaiting admin approval
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current user (Source of truth for Dashboard)
exports.getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};