import { useState, useEffect } from 'react';
import socketService from '../utils/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sock = socketService.connect();
    setSocket(sock);

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return { socket, connected };
};
