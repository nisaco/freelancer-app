const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

const initSocket = (httpServer) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || [
    'https://linkupgh.live',
    'https://www.linkupgh.live',
    'https://hireme-bk0l.onrender.com',
    'https://linkup-bk0l.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ].join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST']
    }
  });

  ioInstance.use((socket, next) => {
    try {
      const authToken = socket.handshake?.auth?.token;
      const headerToken = socket.handshake?.headers?.authorization?.replace('Bearer ', '');
      const token = authToken || headerToken;

      if (!token) {
        return next(new Error('Socket authentication failed'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      return next();
    } catch (error) {
      return next(new Error('Socket authentication failed'));
    }
  });

  ioInstance.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${String(userId)}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };

