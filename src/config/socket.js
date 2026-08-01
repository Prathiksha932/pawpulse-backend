import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../features/users/user.model.js';
import { Message } from '../features/consultations/message.model.js';
import { env } from './env.js';
import { logger } from './logger.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket-level authentication middleware — the equivalent of authenticate.js, for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) return next(new Error('Invalid or inactive user'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.fullName} (${socket.id})`);

    socket.on('join-consultation', (consultationId) => {
      socket.join(consultationId);
    });

    socket.on('send-message', async ({ consultationId, content }) => {
      try {
        const message = await Message.create({
          consultationId,
          senderId: socket.user._id,
          content,
        });

        io.to(consultationId).emit('new-message', {
          _id: message._id,
          consultationId,
          senderId: socket.user._id,
          senderName: socket.user.fullName,
          content,
          createdAt: message.createdAt,
        });
      } catch (error) {
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user.fullName}`);
    });
  });

  return io;
};