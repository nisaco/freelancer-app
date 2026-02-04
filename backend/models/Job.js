const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  // 1. ADD THIS FIELD (Since your error says it's required)
  serviceType: { type: String }, 
  // 2. FIX THE ENUM (Make sure 'pending_payment' is allowed)
  status: { 
    type: String, 
    enum: ['pending_payment', 'awaiting_confirmation', 'paid', 'completed', 'cancelled', 'pending'], 
    default: 'pending_payment' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);