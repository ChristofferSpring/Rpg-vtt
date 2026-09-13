require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const registerGameSocket = require('./sockets/gameSocket');
const { ready } = require('./database/db');

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

// Uploaded game assets (backgrounds, later token images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io config
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins, methods: ["GET", "POST"] } });
app.set('io', io);

registerGameSocket(io);

// Any non-API route falls through to React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

// Don't accept requests until the schema (tables + additive column
// migrations) is confirmed ready — otherwise a cold start against an
// unmigrated database could serve requests before tables/columns exist.
ready
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 SERVER RUNNING ON ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Schema initialization failed:', error);
    process.exit(1);
  });
