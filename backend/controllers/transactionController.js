const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.requestPayout = async (req, res) => {
  try {
    const { amount, momoNumber, network } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Check if they have enough balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 2. Deduct from balance immediately
    user.walletBalance -= amount;
    await user.save();

    // 3. Create transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      momoNumber,
      network
    });

    res.status(201).json({ message: "Payout requested successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: "Payout request failed" });
  }
};

// Admin function to mark as paid
exports.completePayout = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Not found" });

    transaction.status = 'completed';
    await transaction.save();

    res.json({ message: "Payout marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction" });
  }
};

// @desc    Get transaction history for the logged-in artisan
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction history" });
  }
};