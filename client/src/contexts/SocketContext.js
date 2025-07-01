import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      socketRef.current = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      // Socket event listeners
      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      socketRef.current.on('ticket-created', (data) => {
        if (user.role === 'help-desk' || user.role === 'admin') {
          toast.success(`New ticket: ${data.ticket.title}`);
        }
      });

      socketRef.current.on('ticket-updated', (data) => {
        toast.success(`Ticket updated: ${data.ticket.title}`);
      });

      socketRef.current.on('comment-added', (data) => {
        toast.success('New comment added to ticket');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  const joinTicket = (ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ticket', ticketId);
    }
  };

  const leaveTicket = (ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-ticket', ticketId);
    }
  };

  const value = {
    socket: socketRef.current,
    joinTicket,
    leaveTicket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 