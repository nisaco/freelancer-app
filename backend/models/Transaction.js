const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  momoNumber: { type: String, required: true },
  network: { type: String, enum: ['MTN', 'Telecel', 'AT'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  type: { type: String, default: 'payout' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);