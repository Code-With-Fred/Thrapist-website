import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '4000', 10),
  mongoUrl: process.env['MONGODB_URL'] || process.env['DATABASE_URL'] || '',
  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET'] || 'access_secret',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'refresh_secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  google: {
    clientId: process.env['GOOGLE_CLIENT_ID'] || '',
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
    callbackUrl: process.env['GOOGLE_CALLBACK_URL'] || 'http://localhost:4000/api/v1/auth/google/callback',
  },
  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'] || '',
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
    connectClientId: process.env['STRIPE_CONNECT_CLIENT_ID'] || '',
  },
  daily: {
    apiKey: process.env['DAILY_API_KEY'] || '',
  },
  cloudinary: {
    cloudName: process.env['CLOUDINARY_CLOUD_NAME'] || '',
    apiKey: process.env['CLOUDINARY_API_KEY'] || '',
    apiSecret: process.env['CLOUDINARY_API_SECRET'] || '',
  },
  resend: {
    apiKey: process.env['RESEND_API_KEY'] || '',
  },
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  platformFeePercent: parseInt(process.env['PLATFORM_FEE_PERCENT'] || '15', 10),
};
