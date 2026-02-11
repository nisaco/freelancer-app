const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved'],
    default: 'open'
  },
  resolution: {
    type: String,
    enum: ['release_to_artisan', 'refund_client', 'hold_funds'],
    default: null
  },
  adminNotes: {
    type: String,
    default: '',
    trim: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

disputeSchema.pre('validate', function buildTicketId(next) {
  if (!this.ticketId) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.ticketId = `DSP-${Date.now().toString(36).toUpperCase()}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);
