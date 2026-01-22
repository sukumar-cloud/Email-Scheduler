import { Queue } from 'bullmq';
import { Email } from '../../domain/entities/Email';
import { bullmqConnection } from '../../config/redis';

const MIN_DELAY_MS = parseInt(process.env.MIN_DELAY_BETWEEN_EMAILS_MS || '2000');

export class EmailQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('email-queue', {
      connection: bullmqConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          count: 1000,
          age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
          count: 5000,
        },
      },
    });

    this.queue.on('error', (err) => {
      console.error('❌ Queue error:', err);
    });
  }

  async add(email: Email): Promise<void> {
    const delay = Math.max(0, email.scheduledAt.getTime() - Date.now());
    const jobId = `email-${email.id}`;

    await this.queue.add(
      'send-email',
      { emailId: email.id },
      {
        delay,
        jobId,
        // Limiter ensures minimum delay between emails
        // This is per-worker, global rate limiting is in RateLimiter
      }
    );

    console.log(`📬 Email queued: ${email.id}, delay: ${delay}ms`);
  }

  async getQueue(): Promise<Queue> {
    return this.queue;
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
