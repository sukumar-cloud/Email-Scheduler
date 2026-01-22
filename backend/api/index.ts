import cors from 'cors';
import express from 'express';
import { prisma } from '../src/config/database';
import redisClient from '../src/config/redis';
import { EmailWorker } from '../src/infra/queue/EmailWorker';
import emailRoutes from '../src/routes/emails';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emails', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize connections
let initialized = false;
let worker: EmailWorker;

const initialize = async () => {
  if (!initialized) {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected');
    
    // Test Redis connection
    await redisClient.ping();
    console.log('Redis connected');
    
    // Start email worker
    worker = new EmailWorker();
    console.log('Email worker started');
    
    initialized = true;
  }
};

// Standard Express server start (uncomment if running standalone)
// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Server running on port ${process.env.PORT || 3000}`);
// });
