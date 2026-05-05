import { Server as SocketServer, Socket } from 'socket.io';

export function setupNotificationSocket(_io: SocketServer, socket: Socket): void {
  const userId = socket.data['userId'] as string;
  // User is already in their personal room: user:{userId}
  // Notifications are sent from route handlers using io.to(`user:${userId}`).emit(...)
  socket.on('notification_read', (notificationId: string) => {
    // Client confirms read - no server action needed here, handled via REST
    void notificationId; // suppress unused warning
    void userId;
  });
}
