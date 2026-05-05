import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  id: string;
  clientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  sessionType: 'video' | 'audio' | 'in_person';
  therapyType: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price: number;
  paymentIntentId?: string;
  roomUrl?: string;
  roomName?: string;
  recordingUrl?: string;
  cancelReason?: string;
  canceledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionType: { type: String, enum: ['video', 'audio', 'in_person'], required: true },
    therapyType: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    notes: String,
    price: { type: Number, required: true },
    paymentIntentId: String,
    roomUrl: String,
    roomName: String,
    recordingUrl: String,
    cancelReason: String,
    canceledAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

BookingSchema.virtual('id').get(function () { return this._id.toString(); });
BookingSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
