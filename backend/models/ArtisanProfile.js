const mongoose = require('mongoose');

const artisanProfileSchema = new mongoose.Schema({
  // This links this profile to a specific login account
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  serviceCategory: { 
    type: String, 
    required: true,
    enum: ['Carpenter', 'Plumber', 'Electrician', 'Mason', 'Painter', 'Mechanic'] 
  },
  profileImage: {
    type: String, // This will store the Cloudinary URL
    default: "https://via.placeholder.com/150" // Default grey image
  },
  bio: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true // e.g., "Cape Coast", "Accra"
  },
  phoneNumber: {
    type: String,
    required: true
  },
  startingPrice: {
    type: Number,
    required: true
  },
workingDays: { 
    type: [String], // Array like ["Monday", "Wednesday", "Friday"]
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] 
  },
  workStartTime: { 
    type: String, 
    default: "08:00" 
  },
  workEndTime: { 
    type: String, 
    default: "17:00" 
  },

  // Array of image URLs showing past work
  portfolio: [
    {
      imageUrl: String,
      description: String
    }
  ],
  // Admin verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  // Average rating calculated from reviews
  rating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ArtisanProfile', artisanProfileSchema);