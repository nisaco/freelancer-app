const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { handleOnboarding, getProfile } = require('../controllers/authController');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists in your backend root
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

// --- ROUTES ---

// Your new onboarding route
router.post('/onboarding', protect, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'ghanaCard', maxCount: 1 }
]), handleOnboarding);

// Existing profile route
router.get('/profile', protect, getProfile);

module.exports = router;