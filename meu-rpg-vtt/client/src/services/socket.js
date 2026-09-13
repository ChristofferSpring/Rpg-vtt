import { io } from 'socket.io-client';
import { BASE_URL, getToken } from './api';

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(BASE_URL, { auth: { token: getToken() } });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
