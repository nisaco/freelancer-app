const User = require('../models/User');
const Notification = require('../models/Notification'); // <--- CRITICAL: ADD THIS
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { POLICY_VERSION, policies } = require('../utils/policies');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Register new user
exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      termsAccepted,
      privacyAccepted,
      acceptedPolicyVersion
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    if (!username || !normalizedEmail || !password) return res.status(400).json({ message: 'Please add all fields' });
    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({ message: 'You must accept Terms and Privacy Policy to create an account' });
    }
    if (acceptedPolicyVersion && acceptedPolicyVersion !== POLICY_VERSION) {
      return res.status(400).json({ message: 'Please re-accept the latest Terms and Privacy Policy' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'client',
      termsAccepted: true,
      privacyAccepted: true,
      acceptedPolicyVersion: POLICY_VERSION,
      acceptedPolicyAt: new Date()
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
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
    const rawIdentifier = email?.trim();
    const normalizedEmail = rawIdentifier?.toLowerCase();
    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.findOne({
        email: { $regex: `^${escapeRegex(rawIdentifier)}$`, $options: 'i' }
      });
    }
    if (!user) {
      user = await User.findOne({ username: rawIdentifier });
    }

    let passwordMatches = false;
    if (user) {
      const storedPassword = user.password || '';
      const looksHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

      if (looksHashed) {
        try {
          passwordMatches = await bcrypt.compare(password, storedPassword);
        } catch (e) {
          passwordMatches = false;
        }
      } else {
        // Legacy support: older accounts may have plain-text passwords.
        passwordMatches = password === storedPassword;
        if (passwordMatches) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
        }
      }
    }

    if (user && passwordMatches) {
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
        isPending: user.isPending,
        profilePic: user.profilePic,
        ghanaCardImage: user.ghanaCardImage,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
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
        user.ghanaCardImage = req.files['ghanaCard'][0].path; 
        user.isPending = true;
        user.isVerified = false;
      }
    }

    await user.save();
    res.status(200).json({ 
      message: "Documents uploaded. Verification pending.",
      profilePic: user.profilePic,
      ghanaCardImage: user.ghanaCardImage,
      isPending: user.isPending,
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};

// @desc    Verify an Artisan
exports.verifyArtisan = async (req, res) => {
  try {
    const { status = 'approve' } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (status === 'approve') {
      if (!user.ghanaCardImage || !user.ghanaCardNumber) {
        return res.status(400).json({ message: "Valid Ghana Card number and image are required before approval." });
      }
      user.isVerified = true;
      user.isPending = false;
    } else if (status === 'reject' || status === 'unverify') {
      user.isVerified = false;
      user.isPending = false;
    } else {
      return res.status(400).json({ message: "Invalid status. Use approve, reject, or unverify." });
    }

    await user.save();

    // Trigger a notification for the artisan
    // This will now work because we imported the Notification model
    await Notification.create({
      recipient: user._id,
      message: status === 'approve'
        ? "Congratulations! Your identity has been verified. You now have the verified badge."
        : "Your verification was not approved yet. Please update your documents and submit again.",
      type: "SYSTEM"
    });

    res.json({ message: `Artisan ${status} successful`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

// @desc    Get active terms/privacy policy document
exports.getPolicies = async (req, res) => {
  res.json(policies);
};
