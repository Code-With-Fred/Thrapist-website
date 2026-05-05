import { Server as SocketServer, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { Conversation, Message } from '../models/Conversation.js';

export function setupChatSocket(io: SocketServer, socket: Socket): void {
  const userId = socket.data['userId'] as string;
  const role = socket.data['role'] as string;

  socket.on('join_conversation', async (conversationId: string) => {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return;

    const isParticipant = role === 'client'
      ? conv.clientId.toString() === userId
      : conv.therapistId.toString() === userId;
    if (!isParticipant) return;

    await socket.join(`conv:${conversationId}`);
  });

  socket.on('send_message', async ({ conversationId, content }: { conversationId: string; content: string }) => {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return;

    const isParticipant = role === 'client'
      ? conv.clientId.toString() === userId
      : conv.therapistId.toString() === userId;
    if (!isParticipant) return;

    const message = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(userId),
      content,
    });

    conv.lastMessage = content;
    conv.lastMessageAt = new Date();
    if (role === 'client') conv.therapistUnread += 1;
    else conv.clientUnread += 1;
    await conv.save();

    io.to(`conv:${conversationId}`).emit('new_message', { ...message.toJSON(), conversationId });
  });

  socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
    socket.to(`conv:${conversationId}`).emit('typing_start', { userId });
  });

  socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
    socket.to(`conv:${conversationId}`).emit('typing_stop', { userId });
  });

  socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return;
    if (role === 'client') conv.clientUnread = 0;
    else conv.therapistUnread = 0;
    await conv.save();

    await Message.updateMany(
      { conversationId: new mongoose.Types.ObjectId(conversationId), senderId: { $ne: new mongoose.Types.ObjectId(userId) }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  });
}
