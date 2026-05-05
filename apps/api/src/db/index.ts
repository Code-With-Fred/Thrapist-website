import mongoose from 'mongoose';
import { config } from '../config/index.js';

export async function connectDB(): Promise<void> {
  if (!config.mongoUrl) throw new Error('MONGODB_URL environment variable is required');
  await mongoose.connect(config.mongoUrl);
  console.log('MongoDB connected');
}

export { mongoose };
