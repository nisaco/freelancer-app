const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The person who is hiring
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The person doing the work (The User ID of the artisan)
    required: true
  },
  serviceType: {
    type: String, // e.g., "Plumbing Fix"
    required: true
  },
  description: {
    type: String, // e.g., "My sink is leaking"
    required: true
  },
  date: {
    type: Date, // When they want the job done
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'rejected'],
    default: 'pending' // Starts as pending until artisan accepts
  },
  price: {
    type: Number // Final agreed price (optional at start)
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Job', jobSchema);