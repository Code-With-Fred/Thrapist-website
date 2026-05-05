import mongoose, { Schema, Document } from 'mongoose';

export interface ITherapistProfile extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  title: string;
  bio: string;
  licenseType: string;
  licenseNumber: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  education: { institution: string; degree: string; year: number }[];
  specialties: string[];
  approaches: string[];
  languages: string[];
  concerns: string[];
  therapyTypes: string[];
  sessionTypes: string[];
  sessionRate: number;
  consultationRate?: number;
  timezone: string;
  location?: string;
  gender?: string;
  isApproved: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  stripeAccountId?: string;
  availability: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

const TherapistProfileSchema = new Schema<ITherapistProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    avatar: String,
    phone: String,
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    licenseType: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    licenseExpiry: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    education: [{ institution: String, degree: String, year: Number }],
    specialties: [String],
    approaches: [String],
    languages: [String],
    concerns: [String],
    therapyTypes: [String],
    sessionTypes: [String],
    sessionRate: { type: Number, default: 0 },
    consultationRate: Number,
    timezone: { type: String, default: 'UTC' },
    location: String,
    gender: String,
    isApproved: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    stripeAccountId: String,
    rejectionReason: String,
    availability: [
      {
        dayOfWeek: Number,
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true },
);

TherapistProfileSchema.virtual('id').get(function () {
  return this._id.toString();
});

TherapistProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const TherapistProfile = mongoose.model<ITherapistProfile>('TherapistProfile', TherapistProfileSchema);
