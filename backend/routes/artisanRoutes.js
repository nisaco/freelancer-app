const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// --- 1. THE MARKETPLACE ROUTE (GET) ---
// This fixes your "404 Not Found" and "Marketplace sync failed" errors.
// Access: Public (Clients need to see artisans)
router.get('/', async (req, res) => {
    try {
        // Find all users where role is 'artisan'
        // We exclude sensitive data like password and ghanaCardNumber
        const artisans = await User.find({ role: 'artisan' })
            .select('-password -ghanaCardNumber -ghanaCardImage');
        
        res.status(200).json(artisans);
    } catch (err) {
        console.error("Fetch Artisans Error:", err.message);
        res.status(500).json({ message: "Error loading marketplace artisans" });
    }
});

// --- 2. THE PROFILE UPDATE ROUTE (PUT) ---
// This handles the "Update Profile" section on the Artisan Dashboard.
// Access: Private (Only the logged-in artisan can update their own profile)
router.put('/update-profile', protect, async (req, res) => {
    try {
        const { phone, bio, price, location, profilePic } = req.body;

        // Ensure price is a number to prevent Schema validation (500) errors
        const numericPrice = price === "" ? 0 : Number(price);

        // Find the user by ID and update specific fields defined in your User.js
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { 
                $set: { 
                    phone: phone || "", 
                    bio: bio || "", 
                    location: location || "", 
                    profilePic: profilePic || "",
                    price: numericPrice
                } 
            },
            { new: true, runValidators: true } // Return the updated doc and check types
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Profile Update Error:", error.message);
        res.status(500).json({ 
            message: "Database update failed", 
            error: error.message 
        });
    }
});

module.exports = router;