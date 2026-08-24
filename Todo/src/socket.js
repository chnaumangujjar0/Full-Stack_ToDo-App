import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_MAIN_URL;

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket']
});