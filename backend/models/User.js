const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Account Info
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    enum: ['client', 'artisan'], 
    default: 'client' 
  },

  // Verification & Status
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isPending: {
    type: Boolean,
    default: false
  },
  ghanaCardNumber: { 
    type: String 
  },
  ghanaCardImage: { 
    type: String 
  }, // Cloudinary URL

  // --- FINANCIAL & WALLET SYSTEM ---
  // Money held in Escrow (Paid by client but not yet released)
  pendingBalance: { 
    type: Number, 
    default: 0 
  },
  // Money available for MoMo withdrawal
  walletBalance: { 
    type: Number, 
    default: 0 
  },

  // --- PROFESSIONAL DATA (Artisan specific) ---
  category: { 
    type: String 
  },
  price: { 
    type: Number, 
    default: 0 
  },
  location: { 
    type: String 
  },
  bio: { 
    type: String 
  },
  profilePic: { 
    type: String 
  }, // Cloudinary URL
  portfolio: [{
    imageUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  phone: { 
    type: String 
  },

  // --- REPUTATION SYSTEM ---
  rating: { 
    type: Number, 
    default: 5.0,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true // Automatically creates createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
