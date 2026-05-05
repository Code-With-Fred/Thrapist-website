import { Notification } from '../models/Notification.js';
import mongoose from 'mongoose';

export const notificationService = {
  async create(data: { userId: string; type: string; title: string; message: string; data?: Record<string, unknown> }) {
    const notification = await Notification.create({ ...data, userId: new mongoose.Types.ObjectId(data.userId) });
    return notification.toJSON();
  },

  async getForUser(userId: string, page = 1, limit = 20) {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return notifications.map(n => n.toJSON());
  },

  async markRead(id: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    return notification?.toJSON();
  },

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  },
};
