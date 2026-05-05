import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from '../config/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { setupChatSocket } from './chat.socket.js';
import { setupNotificationSocket } from './notification.socket.js';

export let io: SocketServer;

export function setupSocket(httpServer: HttpServer): void {
  io = new SocketServer(httpServer, {
    cors: { origin: config.frontendUrl, credentials: true },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      socket.data['userId'] = payload.userId;
      socket.data['role'] = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    socket.join(`user:${userId}`);

    setupChatSocket(io, socket);
    setupNotificationSocket(io, socket);

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
    });
  });
}
