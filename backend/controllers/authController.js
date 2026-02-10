const User = require('../models/User');
const Notification = require('../models/Notification'); // <--- CRITICAL: ADD THIS
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
        profilePic: user.profilePic,
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

// @desc    Handle File Uploads for Verification (Cloudinary Version)
exports.handleOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Since we are using CloudinaryStorage in authRoutes, 
    // req.files['field'][0].path is the actual URL.
    if (req.files) {
      if (req.files['profilePic']) {
        user.profilePic = req.files['profilePic'][0].path; 
      }
      
      if (req.files['ghanaCard']) {
        user.ghanaCard = req.files['ghanaCard'][0].path; 
      }
    }

    await user.save();
    res.status(200).json({ 
      message: "Documents uploaded. Verification pending.",
      profilePic: user.profilePic,
      ghanaCard: user.ghanaCard 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};

// @desc    Verify an Artisan
exports.verifyArtisan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true; 
    await user.save();

    // Trigger a notification for the artisan
    // This will now work because we imported the Notification model
    await Notification.create({
      recipient: user._id,
      message: "Congratulations! Your identity has been verified. You now have the verified badge.",
      type: "JOB_COMPLETED" // Or add a 'SYSTEM' type to your model enum
    });

    res.json({ message: "Artisan verified successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};