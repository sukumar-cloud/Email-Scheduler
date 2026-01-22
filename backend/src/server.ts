import 'dotenv/config';
import app from './app';
import { prisma } from './config/database';
import redisClient from './config/redis';
import { EmailWorker } from './infra/queue/EmailWorker';
import { getMailTransporter } from './config/email';

const PORT = process.env.PORT || 3001;

let emailWorker: EmailWorker;

async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Test Redis connection
        await redisClient.ping();
        console.log('✅ Redis connected');

        // Initialize email transporter
        await getMailTransporter();
        console.log('✅ Email transporter initialized');

        // Start BullMQ worker
        emailWorker = new EmailWorker();
        console.log('✅ Email worker started');

        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📧 Email scheduler ready`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n${signal} received, shutting down gracefully...`);

            server.close(async () => {
                console.log('HTTP server closed');

                // Close worker
                if (emailWorker) {
                    await emailWorker.close();
                    console.log('Worker closed');
                }

                // Close database
                await prisma.$disconnect();
                console.log('Database disconnected');

                // Close Redis
                redisClient.disconnect();
                console.log('Redis disconnected');

                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
