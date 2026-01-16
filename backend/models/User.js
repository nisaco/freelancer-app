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
  // The role determines if they can create an Artisan Profile
  role: { 
    type: String, 
    enum: ['client', 'artisan', 'admin'], 
    default: 'client' 
  },
  profilePic: {
    type: String, // Store the URL from Cloudinary/AWS here
    default: ""
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);