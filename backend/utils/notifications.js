const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

const createNotification = async (payload) => {
  const notification = await Notification.create(payload);
  emitToUser(payload.recipient, 'notification:new', { notification });
  return notification;
};

module.exports = { createNotification };
