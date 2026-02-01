import { useState, useEffect } from 'react';
import socketService from '../utils/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sock = socketService.connect();
    setSocket(sock);
    
    // Set initial connection state
    setConnected(sock.connected);

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    return () => {
      // Don't disconnect on unmount, keep connection alive
      sock.off('connect');
      sock.off('disconnect');
    };
  }, []);

  return { socket, connected };
};
