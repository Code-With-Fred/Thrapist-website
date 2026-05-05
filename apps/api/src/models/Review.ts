import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  id: string;
  clientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  content?: string;
  isAnonymous: boolean;
  therapistReply?: string;
  therapistRepliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: String,
    isAnonymous: { type: Boolean, default: false },
    therapistReply: String,
    therapistRepliedAt: Date,
  },
  { timestamps: true },
);

ReviewSchema.virtual('id').get(function () { return this._id.toString(); });
ReviewSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
