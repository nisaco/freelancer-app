const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Request a payout (Artisan)
// @route   POST /api/transactions/request
exports.requestPayout = async (req, res) => {
  try {
    const { amount, momoNumber, network } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Please enter a valid amount" });
    }

    const user = await User.findById(req.user.id);

    // 1. Check if they have enough balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 2. Deduct from balance immediately (Moves funds to 'Pending' state)
    user.walletBalance -= Number(amount);
    await user.save();

    // 3. Create transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      momoNumber,
      network,
      status: 'pending'
    });

    res.status(201).json({ message: "Payout requested successfully", transaction });
  } catch (error) {
    console.error("Payout Request Error:", error);
    res.status(500).json({ message: "Payout request failed" });
  }
};

// @desc    Get ALL payout requests (Admin Only)
// @route   GET /api/transactions/admin/all
exports.getAllPayouts = async (req, res) => {
    try {
      // Basic role check - ensure your 'protect' middleware attaches the user role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const transactions = await Transaction.find()
        .populate('user', 'username email phone')
        .sort({ createdAt: -1 });
        
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payout queue" });
    }
};

// @desc    Mark payout as paid (Admin Only)
// @route   PUT /api/transactions/complete/:id
exports.completePayout = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized action" });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status === 'completed') {
        return res.status(400).json({ message: "Transaction already processed" });
    }

    transaction.status = 'completed';
    await transaction.save();

    res.json({ message: "Payout marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction" });
  }
};

// @desc    Get transaction history for the logged-in artisan
// @route   GET /api/transactions/my-transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction history" });
  }
};