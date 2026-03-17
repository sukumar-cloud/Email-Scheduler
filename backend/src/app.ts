import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import passport from './config/auth';
import authRoutes from './routes/auth';
import emailRoutes from './routes/emails';
import { redisClient } from './config/redis';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');

const isAllowedOrigin = (origin: string) => {
    const normalized = normalizeOrigin(origin);
    const allowedFrontend = normalizeOrigin(FRONTEND_URL);

    if (normalized === allowedFrontend) return true;
    if (normalized === 'http://localhost:3000') return true;
    if (normalized === 'http://localhost:3001') return true;

    try {
        const url = new URL(normalized);
        return url.protocol === 'https:' && url.hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
};

// Initialize store.
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
});

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return isAllowedOrigin(origin)
            ? callback(null, true)
            : callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    session({
        store: redisStore,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
        proxy: process.env.NODE_ENV === 'production',
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

export default app;
