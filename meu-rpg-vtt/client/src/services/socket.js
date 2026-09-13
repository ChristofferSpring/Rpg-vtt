import { io } from 'socket.io-client';
import { BASE_URL, getToken } from './api';

let socket = null;
let currentRoom = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(BASE_URL, { auth: { token: getToken() } });

  // Socket.io auto-reconnects after a dropped connection, but a fresh
  // connection has no server-side gameId/gameRole until 'join_room' is
  // re-emitted. Re-join whatever room was last active so reconnects don't
  // silently break move_token/send_message.
  socket.on('connect', () => {
    if (currentRoom) socket.emit('join_room', currentRoom);
  });

  // Mirrors the expired-session handling in services/api.js's request():
  // an invalid/expired JWT fails the handshake, so drop it and force a
  // fresh login rather than leaving the app in a half-connected state.
  socket.on('connect_error', () => {
    localStorage.removeItem('rpg_user');
    window.location.reload();
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom(gameId) {
  currentRoom = gameId;
  socket?.emit('join_room', gameId);
}

export function leaveRoom() {
  socket?.emit('leave_room');
  currentRoom = null;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  currentRoom = null;
}
