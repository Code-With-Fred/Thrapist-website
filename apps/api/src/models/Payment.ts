import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  bookingId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  therapistPayout: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeTransferId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    therapistPayout: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'pending' },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    stripeTransferId: String,
    failureReason: String,
  },
  { timestamps: true },
);

PaymentSchema.virtual('id').get(function () { return this._id.toString(); });
PaymentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { const r = ret as unknown as Record<string, unknown>; delete r['_id']; delete r['__v']; return r; },
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
