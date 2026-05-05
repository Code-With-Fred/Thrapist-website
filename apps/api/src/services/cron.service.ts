import cron from 'node-cron';
import { Booking } from '../models/Booking.js';
import { emailService } from './email.service.js';
import { pino } from 'pino';

const logger = pino();

export function startCronJobs(): void {
  // Send reminders 24h before sessions
  cron.schedule('0 * * * *', async () => {
    try {
      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000);

      const upcoming = await Booking.find({
        status: 'confirmed',
        scheduledAt: { $gte: in23h, $lte: in24h },
      }).populate('clientId therapistId');

      logger.info(`Cron: ${upcoming.length} upcoming sessions to remind`);
    } catch (err) {
      logger.error(err, 'Cron: reminder job failed');
    }
  });

  // Mark no-shows
  cron.schedule('*/15 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 15 * 60 * 1000);
      await Booking.updateMany(
        { status: 'confirmed', scheduledAt: { $lt: cutoff } },
        { status: 'no_show' },
      );
    } catch (err) {
      logger.error(err, 'Cron: no-show job failed');
    }
  });

  logger.info('Cron jobs started');
}
