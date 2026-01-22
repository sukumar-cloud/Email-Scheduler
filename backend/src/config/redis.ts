import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisPassword = process.env.REDIS_PASSWORD;

// Use connection URL for Upstash, or standard config for local Redis
let redisClient: Redis;

if (redisPassword && redisHost.includes('upstash.io')) {
    // Upstash Redis - use rediss:// URL format with port 6379 (TLS enabled)
    const redisUrl = `rediss://default:${redisPassword}@${redisHost}:6379`;
    redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4, // Use IPv4
        connectTimeout: 10000, // 10 second timeout
    });
} else {
    // Local Redis or other providers
    redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });
}

export { redisClient };

redisClient.on('connect', () => {
    console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

export default redisClient;
