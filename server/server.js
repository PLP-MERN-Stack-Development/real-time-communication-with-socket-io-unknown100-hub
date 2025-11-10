// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const state = require('./utils/state');
const { initSocket } = require('./socket');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// Middleware
const isProd = process.env.NODE_ENV === 'production';
app.use(
  cors(
    isProd
      ? { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }
      : { origin: true, credentials: true }
  )
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to database (optional if URI not set)
connectDB();

// API routes
app.get('/api/messages', (req, res) => {
  res.json(state.messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(state.users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Health endpoint for quick checks
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Start server with retry if port is busy
let currentPort = parseInt(process.env.PORT || 5000, 10);
const maxRetries = 5;
let attempts = 0;

const start = () => {
  server.listen(currentPort, () => {
    console.log(`Server running on port ${currentPort}`);
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && attempts < maxRetries) {
    attempts += 1;
    console.warn(`Port ${currentPort} in use. Trying ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(start, 500);
  } else {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
});

start();

module.exports = { app, server, io };
