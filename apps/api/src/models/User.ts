import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  passwordHash?: string;
  role: 'client' | 'therapist' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  googleId?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['client', 'therapist', 'admin'], required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    googleId: { type: String, sparse: true },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

UserSchema.virtual('id').get(function () {
  return this._id.toString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r['_id'];
    delete r['__v'];
    delete r['passwordHash'];
    delete r['verificationToken'];
    delete r['verificationTokenExpires'];
    delete r['resetToken'];
    delete r['resetTokenExpires'];
    delete r['refreshToken'];
    return r;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
