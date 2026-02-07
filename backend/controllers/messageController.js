const Message = require('../models/Message');

// @desc    Get chat history between two users
// @route   GET /api/messages/:recipientId
exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { recipient, text } = req.body;
    const sender = req.user.id;

    const newMessage = await Message.create({
      sender,
      recipient,
      text
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};