// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['NEW_BOOKING', 'PAYMENT_RECEIVED', 'JOB_COMPLETED', 'NEW_MESSAGE'], 
    required: true 
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of the Job or Message
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);