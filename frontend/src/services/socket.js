import { io } from 'socket.io-client';

let socketInstance = null;
let activeToken = null;

const SOCKET_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://hireme-bk0l.onrender.com';

export const connectSocket = (token) => {
  if (!token) return null;

  if (socketInstance && activeToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  activeToken = token;
  socketInstance = io(SOCKET_BASE, {
    transports: ['websocket', 'polling'],
    auth: { token }
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  activeToken = null;
};

export const getSocket = () => socketInstance;
