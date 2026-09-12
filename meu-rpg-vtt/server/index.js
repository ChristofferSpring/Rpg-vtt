require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Only matters for cross-origin requests (e.g. Vite dev server on :5173
// talking to this API on :3001). The production build is served from
// this same origin, so it never hits this check.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Mounts all routes defined in routes.js
app.use('/api', routes); // /api prefix keeps things organized (e.g. /api/login)

// Static frontend config
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// Socket.io config
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins, methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Example: join a specific game room
  socket.on('join_room', (gameId) => {
    socket.join(gameId);
    console.log(`Socket ${socket.id} joined game ${gameId}`);
  });
});

// Any non-API route falls through to React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING ON ${PORT}`);
});
