import mongoose, { Schema, Document } from 'mongoose';

export interface IClientProfile extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    avatar: String,
    phone: String,
    dateOfBirth: String,
    bio: String,
    location: String,
    timezone: String,
    language: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
  },
  { timestamps: true },
);

ClientProfileSchema.virtual('id').get(function () {
  return this._id.toString();
});

ClientProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const ClientProfile = mongoose.model<IClientProfile>('ClientProfile', ClientProfileSchema);
