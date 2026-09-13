import { io } from 'socket.io-client';
import { BASE_URL, getToken } from './api';

let socket = null;
let currentRoom = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(BASE_URL, { auth: { token: getToken() } });

  // re-join on reconnect, otherwise the socket sits roomless after a drop
  socket.on('connect', () => {
    if (currentRoom) socket.emit('join_room', currentRoom);
  });

  // bad/expired token -> same handling as an expired REST session
  socket.on('connect_error', () => {
    localStorage.removeItem('rpg_user');
    window.location.reload();
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinRoom(gameId, onJoined) {
  currentRoom = gameId;
  socket?.emit('join_room', gameId, onJoined);
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
