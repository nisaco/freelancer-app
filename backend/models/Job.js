const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  serviceType: { type: String, default: 'General Service' },
  paymentReference: { type: String, default: null },
  isHighValue: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  reviewComment: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  escrowReleasedAt: { type: Date, default: null },
  invoiceNumber: { type: String, default: null },
  invoiceIssuedAt: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['pending_payment', 'awaiting_confirmation', 'paid', 'completed', 'cancelled', 'pending'], 
    default: 'pending_payment' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
