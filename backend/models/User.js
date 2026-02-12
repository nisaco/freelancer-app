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
    enum: ['client', 'artisan', 'admin'], 
    default: 'client' 
  },

  // Legal acceptance
  termsAccepted: {
    type: Boolean,
    default: false
  },
  privacyAccepted: {
    type: Boolean,
    default: false
  },
  acceptedPolicyVersion: {
    type: String,
    default: null
  },
  acceptedPolicyAt: {
    type: Date,
    default: null
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
  momoNumber: {
    type: String
  },
  momoNetwork: {
    type: String
  },

  // --- SUBSCRIPTIONS ---
  subscriptionTier: {
    type: String,
    enum: ['free', 'gold'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'expired'],
    default: 'inactive'
  },
  subscriptionStartedAt: {
    type: Date,
    default: null
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },
  subscriptionReference: {
    type: String,
    default: null
  },

  // --- ANALYTICS ---
  profileViewsTotal: {
    type: Number,
    default: 0
  },
  profileViewsToday: {
    type: Number,
    default: 0
  },
  profileViewsDate: {
    type: Date,
    default: null
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
  workExperience: {
    type: String,
    default: ''
  },
  educationBackground: {
    type: String,
    default: ''
  },
  educationInstitution: {
    type: String,
    default: ''
  },
  educationStatus: {
    type: String,
    enum: ['', 'ongoing', 'completed'],
    default: ''
  },
  educationCompletionYear: {
    type: String,
    default: ''
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
  whatsappPhone: {
    type: String
  },
  whatsappOptIn: {
    type: Boolean,
    default: true
  },
  busySlots: [{
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    note: { type: String, default: '' },
    location: { type: String, default: '' }
  }],

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
