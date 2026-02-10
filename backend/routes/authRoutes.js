const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // <--- ADD THIS LINE!
const { protect } = require('../middleware/authMiddleware');

const { 
  registerUser, 
  loginUser, 
  getProfile, 
  handleOnboarding 
} = require('../controllers/authController');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
});
//upload profile picture
router.post('/update-photo', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.file) {
      // Store the path so it's accessible via the static /uploads route
      user.profilePic = `uploads/${req.file.filename}`;
      await user.save();
      res.status(200).json({ profilePic: user.profilePic });
    }
  } catch (err) {
    console.error(err);// This helps see the REAL error in Render logs
    res.status(500).json({ message: "Photo update failed" });
  }
});
// --- ROUTES ---

// Public Routes (No 'protect' needed)
router.post('/register', registerUser);
router.post('/login', loginUser); // THIS WAS MISSING - FIXES 404

// Private Routes (Need 'protect')
router.get('/profile', protect, getProfile);

router.post('/onboarding', protect, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'ghanaCard', maxCount: 1 }
]), handleOnboarding);



module.exports = router;