const Message = require('../models/Message');

// @desc    Get chat history between two users
// @route   GET /api/messages/:recipientId
exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user.id;

    await Message.updateMany(
      {
        sender: recipientId,
        recipient: senderId,
        isRead: false
      },
      { $set: { isRead: true } }
    );

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
    const { recipient, text, content } = req.body;
    const sender = req.user.id;
    const messageContent = (content || text || '').trim();

    if (!recipient || !messageContent) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    const newMessage = await Message.create({
      sender,
      recipient,
      content: messageContent
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// @desc    Get all conversations for the inbox
// @route   GET /api/messages/inbox
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 }).populate('sender recipient', 'username');

    const conversations = [];
    const seen = new Set();

    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      if (!seen.has(otherUser._id.toString())) {
        seen.add(otherUser._id.toString());
        conversations.push({
          otherUser,
          lastMessage: msg.content || msg.text || '',
          createdAt: msg.createdAt
        });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Inbox sync failed' });
  }
};
