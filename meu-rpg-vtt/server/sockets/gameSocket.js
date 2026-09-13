const jwt = require('jsonwebtoken');
const { UserGame } = require('../database/db');

function registerGameSocket(io) {
  // Verifies the JWT sent in the connection handshake before accepting the socket
  io.use((socket, next) => {
    const { token } = socket.handshake.auth || {};
    if (!token) {
      return next(new Error('Token not provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // A socket only ever has one active game room at a time in this app
    socket.on('join_room', async (gameId) => {
      try {
        const membership = await UserGame.findOne({
          where: { UserId: socket.userId, GameId: Number(gameId) }
        });
        if (!membership) {
          socket.emit('error', { message: 'Not a member of this game' });
          return;
        }
        socket.join(String(gameId));
        socket.gameId = Number(gameId);
        socket.gameRole = membership.role;
        console.log(`Socket ${socket.id} joined game ${gameId}`);
      } catch (error) {
        socket.emit('error', { message: 'Error joining game room' });
      }
    });
  });
}

module.exports = registerGameSocket;
