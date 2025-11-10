// socket/client.js - Socket.io client singleton
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/socket.io';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  path: SOCKET_PATH,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  timeout: 10000,
});

export default socket;
