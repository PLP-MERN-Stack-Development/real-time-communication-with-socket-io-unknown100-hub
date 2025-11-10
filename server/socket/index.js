const { Server } = require('socket.io');
const state = require('../utils/state');

function initSocket(server) {
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const io = new Server(server, {
    cors: isProd
      ? { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true }
      : { origin: (origin, cb) => cb(null, true), methods: ['GET', 'POST'], credentials: true },
    path: process.env.SOCKET_IO_PATH || '/socket.io',
    allowEIO3: true,
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('user_join', (username) => {
      state.users[socket.id] = { username, id: socket.id };
      io.emit('user_list', Object.values(state.users));
      io.emit('user_joined', { username, id: socket.id });
      console.log(`${username} joined the chat`);
    });

    socket.on('send_message', ({ message, clientId }) => {
      const msg = {
        id: Date.now(),
        message,
        sender: state.users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        timestamp: new Date().toISOString(),
        clientId: clientId || null,
        status: 'delivered',
      };
      state.messages.push(msg);
      if (state.messages.length > 100) state.messages.shift();
      io.emit('receive_message', msg);
    });

    socket.on('typing', (isTyping) => {
      const current = state.users[socket.id];
      if (!current) return;
      if (isTyping) state.typingUsers[socket.id] = current.username;
      else delete state.typingUsers[socket.id];
      io.emit('typing_users', Object.values(state.typingUsers));
    });

    socket.on('private_message', ({ to, message, clientId }) => {
      const messageData = {
        id: Date.now(),
        sender: state.users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message,
        timestamp: new Date().toISOString(),
        isPrivate: true,
        clientId: clientId || null,
        status: 'delivered',
      };
      socket.to(to).emit('private_message', messageData);
      socket.emit('private_message', messageData);
    });

    socket.on('disconnect', () => {
      const user = state.users[socket.id];
      if (user) {
        io.emit('user_left', { username: user.username, id: socket.id });
        console.log(`${user.username} left the chat`);
      }
      delete state.users[socket.id];
      delete state.typingUsers[socket.id];
      io.emit('user_list', Object.values(state.users));
      io.emit('typing_users', Object.values(state.typingUsers));
    });
  });

  return io;
}

module.exports = { initSocket };
