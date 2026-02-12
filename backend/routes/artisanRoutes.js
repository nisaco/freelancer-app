const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- 1. GET ALL ARTISANS (For Marketplace) ---
router.get('/', async (req, res) => {
    try {
        const { category, location } = req.query;
        const query = { role: 'artisan' };

        if (category && category !== 'All') {
            query.category = category;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const artisans = await User.find(query)
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
        const {
            phone,
            bio,
            price,
            location,
            profilePic,
            momoNumber,
            momoNetwork,
            whatsappPhone,
            whatsappOptIn,
            workExperience,
            educationBackground,
            educationInstitution,
            educationStatus,
            educationCompletionYear
        } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) user.phone = phone || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'bio')) user.bio = bio || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'price')) user.price = price !== undefined ? Number(price) : user.price;
            if (Object.prototype.hasOwnProperty.call(req.body, 'location')) user.location = location || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'profilePic')) user.profilePic = profilePic || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'momoNumber')) user.momoNumber = momoNumber || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'momoNetwork')) user.momoNetwork = momoNetwork || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'whatsappPhone')) user.whatsappPhone = whatsappPhone || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'workExperience')) user.workExperience = workExperience || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'educationBackground')) user.educationBackground = educationBackground || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'educationInstitution')) user.educationInstitution = educationInstitution || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'educationStatus')) user.educationStatus = educationStatus || '';
            if (Object.prototype.hasOwnProperty.call(req.body, 'educationCompletionYear')) user.educationCompletionYear = educationCompletionYear || '';
            if (whatsappOptIn !== undefined) {
                user.whatsappOptIn = Boolean(whatsappOptIn);
            }
            
            const updatedUser = await user.save();
            const responseUser = updatedUser.toObject();
            delete responseUser.password;

            res.json({ message: "Profile updated", user: responseUser });
        }
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

router.put('/portfolio', protect, upload.array('portfolio', 8), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== 'artisan') return res.status(403).json({ message: "Only artisans can upload portfolio items" });
        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

        const incomingCaptions = req.body.captions || req.body.caption || [];
        const captions = Array.isArray(incomingCaptions) ? incomingCaptions : [incomingCaptions];
        const entries = req.files.map((file, index) => ({
            imageUrl: file.path,
            caption: (captions[index] || '').toString().trim()
        }));

        user.portfolio = [...(user.portfolio || []), ...entries].slice(0, 24);
        await user.save();

        res.json({ message: "Portfolio updated", portfolio: user.portfolio });
    } catch (error) {
        console.error("Portfolio upload failed:", error);
        res.status(500).json({ message: "Portfolio upload failed" });
    }
});

router.delete('/portfolio/:index', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== 'artisan') return res.status(403).json({ message: "Only artisans can modify portfolio" });

        const index = Number(req.params.index);
        if (!Number.isInteger(index) || index < 0 || index >= (user.portfolio || []).length) {
            return res.status(400).json({ message: "Invalid portfolio index" });
        }

        user.portfolio.splice(index, 1);
        await user.save();
        res.json({ message: "Portfolio item removed", portfolio: user.portfolio });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete portfolio item" });
    }
});

module.exports = router;
