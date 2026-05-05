import mongoose, { Schema, Document } from 'mongoose';

export interface IDatingProfile extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  photos: string[];
  bio?: string;
  birthDate?: Date;
  gender?: string;
  lookingFor?: string;
  interests: string[];
  location?: string;
  isActive: boolean;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDatingMatch extends Document {
  id: string;
  user1Id: mongoose.Types.ObjectId;
  user2Id: mongoose.Types.ObjectId;
  status: 'pending' | 'matched' | 'rejected';
  matchedAt?: Date;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDatingMessage extends Document {
  id: string;
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const DatingProfileSchema = new Schema<IDatingProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    photos: [String],
    bio: String,
    birthDate: Date,
    gender: String,
    lookingFor: String,
    interests: [String],
    location: String,
    isActive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
  },
  { timestamps: true },
);

DatingProfileSchema.virtual('id').get(function () { return this._id.toString(); });
DatingProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

const DatingMatchSchema = new Schema<IDatingMatch>(
  {
    user1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'matched', 'rejected'], default: 'pending' },
    matchedAt: Date,
    lastActivity: Date,
  },
  { timestamps: true },
);

DatingMatchSchema.virtual('id').get(function () { return this._id.toString(); });
DatingMatchSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

const DatingMessageSchema = new Schema<IDatingMessage>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'DatingMatch', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

DatingMessageSchema.virtual('id').get(function () { return this._id.toString(); });
DatingMessageSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const DatingProfile = mongoose.model<IDatingProfile>('DatingProfile', DatingProfileSchema);
export const DatingMatch = mongoose.model<IDatingMatch>('DatingMatch', DatingMatchSchema);
export const DatingMessage = mongoose.model<IDatingMessage>('DatingMessage', DatingMessageSchema);
