const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// --- 1. GET ALL ARTISANS (For Marketplace) ---
router.get('/', async (req, res) => {
    try {
        const artisans = await User.find({ role: 'artisan' })
            .select('-password -ghanaCardNumber -ghanaCardImage');
        res.json(artisans);
    } catch (err) {
        res.status(500).json({ message: "Error loading artisans" });
    }
});

// --- 2. GET ME (Fresh User Data) ---
// THIS FIXES THE "SYNC ERROR" ON THE DASHBOARD
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- 3. UPDATE PROFILE ---
router.put('/update-profile', protect, async (req, res) => {
    try {
        const { phone, bio, price, location, profilePic, momoNumber, momoNetwork } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.phone = phone || user.phone;
            user.bio = bio || user.bio;
            user.price = price !== undefined ? Number(price) : user.price;
            user.location = location || user.location;
            user.profilePic = profilePic || user.profilePic;
            user.momoNumber = momoNumber || user.momoNumber;
            user.momoNetwork = momoNetwork || user.momoNetwork;
            
            const updatedUser = await user.save();
            const responseUser = updatedUser.toObject();
            delete responseUser.password;

            res.json({ message: "Profile updated", user: responseUser });
        }
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

module.exports = router;