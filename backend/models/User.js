const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['client', 'artisan', 'admin'], 
    default: 'client' 
  },
  profilePic: {
    type: String, 
    default: ""
  },

  // --- ADDED FOR ARTISAN VERIFICATION & SEARCH ---
  category: { 
    type: String, 
    default: "" 
  }, 
  price: { 
    type: Number, 
    default: 0 
  }, 
  location: { 
    type: String, 
    default: "" 
  },
  bio: { 
    type: String, 
    default: "" 
  },
  ghanaCardNumber: { 
    type: String, 
    default: "" 
  },
  ghanaCardImage: { 
    type: String, // URL to the Ghana Card photo
    default: "" 
  },
  
  // VERIFICATION LOGIC
  isVerified: { 
    type: Boolean, 
    default: false // Set to true by Admin after checking Ghana Card
  },
  isPending: { 
    type: Boolean, 
    default: false // Becomes true when they finish ProfileSetup
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);