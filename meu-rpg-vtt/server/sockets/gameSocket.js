const jwt = require('jsonwebtoken');
const { UserGame, Token, ChatMessage } = require('../database/db');

const ALLOWED_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];
const MAX_DICE_COUNT = 20;

function registerGameSocket(io) {
  // check the JWT before accepting the connection at all
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

    socket.on('join_room', async (gameId) => {
      try {
        const membership = await UserGame.findOne({
          where: { UserId: socket.userId, GameId: Number(gameId) }
        });
        if (!membership) {
          socket.emit('error', { message: 'Not a member of this game', scope: 'room' });
          return;
        }
        socket.join(String(gameId));
        socket.gameId = Number(gameId);
        socket.gameRole = membership.role;
        console.log(`Socket ${socket.id} joined game ${gameId}`);
      } catch (error) {
        console.error('Error in join_room:', error);
        socket.emit('error', { message: 'Error joining game room', scope: 'room' });
      }
    });

    // opposite of join_room - clears the room so a game switch doesn't leak
    // broadcasts from the old one
    socket.on('leave_room', () => {
      if (socket.gameId) {
        socket.leave(String(socket.gameId));
        console.log(`Socket ${socket.id} left game ${socket.gameId}`);
      }
      socket.gameId = undefined;
      socket.gameRole = undefined;
    });

    socket.on('move_token', async ({ tokenId, x, y }) => {
      if (!socket.gameId) {
        socket.emit('error', { message: 'Join a game room first', scope: 'action' });
        return;
      }
      try {
        const token = await Token.findByPk(tokenId);
        if (!token || token.GameId !== socket.gameId) {
          socket.emit('error', { message: 'Token not found in this game', scope: 'action' });
          return;
        }

        const isMaster = socket.gameRole === 'MASTER';
        const isOwner = token.ownerId === socket.userId;
        if (!isMaster && !isOwner) {
          socket.emit('error', { message: 'You cannot move this token', scope: 'action' });
          return;
        }

        await token.update({ x, y });
        io.to(String(socket.gameId)).emit('token_moved', { tokenId: token.id, x, y });
      } catch (error) {
        console.error('Error in move_token:', error);
        socket.emit('error', { message: 'Error moving token', scope: 'action' });
      }
    });

    socket.on('send_message', async ({ text }) => {
      if (!socket.gameId) {
        socket.emit('error', { message: 'Join a game room first', scope: 'action' });
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
        console.error('Error in send_message:', error);
        socket.emit('error', { message: 'Error sending message', scope: 'action' });
      }
    });

    socket.on('roll_dice', async ({ sides, count }) => {
      if (!socket.gameId) {
        socket.emit('error', { message: 'Join a game room first', scope: 'action' });
        return;
      }
      const rollCount = Number(count) || 1;
      if (!ALLOWED_DICE_SIDES.includes(Number(sides)) || rollCount < 1 || rollCount > MAX_DICE_COUNT) {
        socket.emit('error', { message: 'Invalid dice roll', scope: 'action' });
        return;
      }
      try {
        const rolls = Array.from({ length: rollCount }, () => 1 + Math.floor(Math.random() * sides));
        const total = rolls.reduce((sum, roll) => sum + roll, 0);
        const text = rollCount === 1
          ? `🎲 rolled a d${sides}: ${total}`
          : `🎲 rolled ${rollCount}d${sides}: ${rolls.join(' + ')} = ${total}`;

        const message = await ChatMessage.create({
          GameId: socket.gameId,
          UserId: socket.userId,
          username: socket.username,
          text
        });
        io.to(String(socket.gameId)).emit('new_message', message);
      } catch (error) {
        console.error('Error in roll_dice:', error);
        socket.emit('error', { message: 'Error rolling dice', scope: 'action' });
      }
    });
  });
}

module.exports = registerGameSocket;
