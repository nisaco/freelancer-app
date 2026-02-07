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

exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    // This looks for all messages where you are either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 }).populate('sender recipient', 'username');

    // Filter to show unique conversations
    const conversations = [];
    const seen = new Set();

    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      if (!seen.has(otherUser._id.toString())) {
        seen.add(otherUser._id.toString());
        conversations.push({
          otherUser,
          lastMessage: msg.text,
          createdAt: msg.createdAt
        });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Inbox failed' });
  }
};