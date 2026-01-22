// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        // --- ADD THESE FIELDS SO THE FRONTEND SEES THEM ON LOGIN ---
        category: user.category,
        bio: user.bio,
        price: user.price,
        location: user.location,
        isVerified: user.isVerified,
        isPending: user.isPending,
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