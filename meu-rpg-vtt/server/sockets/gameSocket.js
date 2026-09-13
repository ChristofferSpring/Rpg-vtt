const jwt = require('jsonwebtoken');
const { UserGame, Token, ChatMessage } = require('../database/db');

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

    socket.on('move_token', async ({ tokenId, x, y }) => {
      if (!socket.gameId) {
        socket.emit('error', { message: 'Join a game room first' });
        return;
      }
      try {
        const token = await Token.findByPk(tokenId);
        if (!token || token.GameId !== socket.gameId) {
          socket.emit('error', { message: 'Token not found in this game' });
          return;
        }

        const isMaster = socket.gameRole === 'MASTER';
        const isOwner = token.ownerId === socket.userId;
        if (!isMaster && !isOwner) {
          socket.emit('error', { message: 'You cannot move this token' });
          return;
        }

        await token.update({ x, y });
        io.to(String(socket.gameId)).emit('token_moved', { tokenId: token.id, x, y });
      } catch (error) {
        socket.emit('error', { message: 'Error moving token' });
      }
    });

    socket.on('send_message', async ({ text }) => {
      if (!socket.gameId) {
        socket.emit('error', { message: 'Join a game room first' });
        return;
      }
      if (!text || !text.trim()) return;
      try {
        const message = await ChatMessage.create({
          GameId: socket.gameId,
          UserId: socket.userId,
          username: socket.username,
          text: text.trim()
        });
        io.to(String(socket.gameId)).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: 'Error sending message' });
      }
    });
  });
}

module.exports = registerGameSocket;
