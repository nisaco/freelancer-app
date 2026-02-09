const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username, email, password: hashedPassword, role: role || 'client'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Authenticate a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Important: compare against user.password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        category: user.category, 
        bio: user.bio,
        price: user.price,
        location: user.location,
        isVerified: user.isVerified,
        profilePic: user.profilePic, // Send this back too!
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current logged in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Handle File Uploads for Verification
exports.handleOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Multer saves files to 'uploads/' and puts the path in req.files
    if (req.files && req.files['profilePic']) {
      // Store the path so the frontend can display the image
      user.profilePic = `uploads/${req.files['profilePic'][0].filename}`;
    }
    
    if (req.files && req.files['ghanaCard']) {
      user.ghanaCardImage = `uploads/${req.files['ghanaCard'][0].filename}`;
    }

    await user.save();
    res.status(200).json({ 
      message: "Documents uploaded. Verification pending.",
      profilePic: user.profilePic 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};