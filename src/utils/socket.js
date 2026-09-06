import { io } from 'socket.io-client';

// Determine backend URL automatically
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  const { protocol, hostname } = window.location;
  // If running in development with Vite on port 5173
  if (window.location.port === '5173') {
    return `${protocol}//${hostname}:3001`;
  }
  // If served from production or same origin
  return window.location.origin;
};

export const socket = io(getBackendUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000
});
