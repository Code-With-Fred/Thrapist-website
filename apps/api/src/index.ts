import 'dotenv/config';
import { connectDB } from './db/index.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { pino } from 'pino';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { setupSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import clientRoutes from './routes/clients.js';
import therapistRoutes from './routes/therapists.js';
import bookingRoutes from './routes/bookings.js';
import sessionRoutes from './routes/sessions.js';
import paymentRoutes from './routes/payments.js';
import walletRoutes from './routes/wallet.js';
import giftCardRoutes from './routes/giftCards.js';
import reviewRoutes from './routes/reviews.js';
import datingRoutes from './routes/dating.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import assessmentRoutes from './routes/assessments.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';

const logger = pino({ level: config.env === 'production' ? 'info' : 'debug' });

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Stripe webhook needs raw body - mount BEFORE json parser for that route
// (handled inside payments route with express.raw)

// API Routes
const api = '/api/v1';
app.use(`${api}/auth`, authRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/clients`, clientRoutes);
app.use(`${api}/therapists`, therapistRoutes);
app.use(`${api}/bookings`, bookingRoutes);
app.use(`${api}/sessions`, sessionRoutes);
app.use(`${api}/payments`, paymentRoutes);
app.use(`${api}/wallet`, walletRoutes);
app.use(`${api}/gift-cards`, giftCardRoutes);
app.use(`${api}/reviews`, reviewRoutes);
app.use(`${api}/dating`, datingRoutes);
app.use(`${api}/matches`, matchRoutes);
app.use(`${api}/conversations`, messageRoutes);
app.use(`${api}/notifications`, notificationRoutes);
app.use(`${api}/assessments`, assessmentRoutes);
app.use(`${api}/upload`, uploadRoutes);
app.use(`${api}/admin`, adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Setup Socket.io
setupSocket(httpServer);

// Start cron jobs
import('./services/cron.service.js').then(m => m.startCronJobs()).catch(err => logger.error(err, 'Failed to start cron jobs'));

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    httpServer.listen(config.port, () => {
      logger.info(`HealMate API running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  })
  .catch((err) => {
    logger.error(err, 'Failed to connect to MongoDB');
    process.exit(1);
  });

export { app, httpServer };
