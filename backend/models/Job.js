const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Optional initially for open bidding jobs
  jobType: { type: String, enum: ['direct', 'bidding'], default: 'direct' },
  serviceType: { type: String, required: true, default: 'General Service' },
  description: { type: String, required: true },
  amount: { type: Number, default: 0 }, // Not strictly required at creation for open bids
  budget: { type: Number }, // Client's estimated budget for open jobs
  date: { type: Date, required: true },
  scheduledStartAt: { type: Date, default: null },
  scheduledEndAt: { type: Date, default: null },
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
    // open: Bidding phase
    // pending_payment: Waiting for client to fund Escrow
    // funded: Money in Escrow, Artisan is working
    // completed: Funds released to Admin Payout Queue
    enum: ['open', 'pending_payment', 'funded', 'in_progress', 'awaiting_confirmation', 'paid', 'completed', 'cancelled', 'disputed',  'pending'], 
    default: 'pending_payment' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);