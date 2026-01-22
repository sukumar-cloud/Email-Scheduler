import { Worker, Job } from 'bullmq';
import redisClient from '../../config/redis';
import { EmailRepositoryImpl } from '../repositories/EmailRepositoryImpl';
import { MailService } from '../mailer/MailService';
import { RateLimiter, RateLimitExceededError } from '../../domain/services/RateLimiter';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');
const MIN_DELAY_MS = parseInt(process.env.MIN_DELAY_BETWEEN_EMAILS_MS || '2000');

export class EmailWorker {
    private worker: Worker;
    private emailRepo: EmailRepositoryImpl;
    private mailer: MailService;
    private rateLimiter: RateLimiter;

    constructor() {
        this.emailRepo = new EmailRepositoryImpl();
        this.mailer = new MailService();
        this.rateLimiter = new RateLimiter();

        this.worker = new Worker('email-queue', this.processJob.bind(this), {
            connection: redisClient,
            concurrency: WORKER_CONCURRENCY,
            limiter: {
                max: 1,
                duration: MIN_DELAY_MS, // Minimum delay between processing jobs
            },
        });

        this.worker.on('completed', (job) => {
            console.log(`✅ Job ${job.id} completed`);
        });

        this.worker.on('failed', (job, err) => {
            console.error(`❌ Job ${job?.id} failed:`, err.message);
        });

        this.worker.on('error', (err) => {
            console.error('❌ Worker error:', err);
        });

        console.log(`🚀 Email worker started with concurrency: ${WORKER_CONCURRENCY}`);
    }

    private async processJob(job: Job): Promise<void> {
        const { emailId } = job.data;

        try {
            const email = await this.emailRepo.findById(emailId);
            if (!email) {
                throw new Error(`Email not found: ${emailId}`);
            }

            // Check if already sent (idempotency)
            if (email.status === 'SENT') {
                console.log(`⏭️  Email ${emailId} already sent, skipping`);
                return;
            }

            // Check rate limit
            try {
                await this.rateLimiter.check(email.sender);
            } catch (error) {
                if (error instanceof RateLimitExceededError) {
                    // Rate limit exceeded - reschedule to next hour
                    const delay = error.nextAvailableTime.getTime() - Date.now();
                    console.log(`⏰ Rate limit exceeded for ${email.sender}, rescheduling in ${Math.round(delay / 1000)}s`);

                    // Re-throw to trigger retry with delay
                    await job.moveToDelayed(delay, job.token!);
                    return;
                }
                throw error;
            }

            // Send email
            await this.mailer.send(email);

            // Mark as sent
            await this.emailRepo.markSent(email.id, new Date());

            console.log(`📧 Email sent successfully: ${emailId}`);
        } catch (error) {
            console.error(`Error processing email ${emailId}:`, error);

            // Mark as failed if max attempts reached
            if (job.attemptsMade >= (job.opts.attempts || 3)) {
                await this.emailRepo.markFailed(emailId);
            }

            throw error;
        }
    }

    async close(): Promise<void> {
        await this.worker.close();
    }

    getWorker(): Worker {
        return this.worker;
    }
}
