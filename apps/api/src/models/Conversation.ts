import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  id: string;
  clientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  clientUnread: number;
  therapistUnread: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  id: string;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: String,
    lastMessageAt: Date,
    clientUnread: { type: Number, default: 0 },
    therapistUnread: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ConversationSchema.index({ clientId: 1, therapistId: 1 }, { unique: true });
ConversationSchema.virtual('id').get(function () { return this._id.toString(); });
ConversationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.virtual('id').get(function () { return this._id.toString(); });
MessageSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
