# Outbox: Production-Grade Email Scheduler

A robust platform for scheduling and sending emails at precise times, with full persistence, rate limiting, and a modern dashboard.

---

## How to Run the Project

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Cloud account (for OAuth credentials)

### 2. Backend (Express, Redis, PostgreSQL, BullMQ Worker)
```bash
# Clone the repository
cd outbox

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Infrastructure (Docker)

```bash
# From project root
docker-compose up -d

# Verify services are running
docker ps
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

### 4. Backend Environment Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reachinbox?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Server
PORT=3001
NODE_ENV="production"

# Session
SESSION_SECRET="your-super-secret-session-key-change-this"

# Google OAuth (REQUIRED - Add your credentials here)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Email (Production SMTP)
SMTP_HOST="your-smtp-host"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# Rate Limiting & Concurrency
MAX_EMAILS_PER_HOUR_PER_SENDER=100
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_EMAILS_MS=2000
```

### 5. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 6. Frontend Environment Setup

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 7. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Backend will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Frontend will start on `http://localhost:3000`

## Architecture

### How Scheduling Works

1. **User schedules emails** via frontend (CSV upload)
2. **API creates Email records** in PostgreSQL
3. **BullMQ adds delayed jobs** to Redis queue
4. **Worker processes jobs** at scheduled time:
   - Checks rate limit (Redis counter)
   - If limit exceeded → reschedules to next hour
   - Sends email via SMTP
   - Updates database status

### Persistence on Restart

- **Jobs stored in Redis** - BullMQ persists jobs to Redis
- **Email records in PostgreSQL** - Database tracks all emails
- **On restart** - Worker reconnects to Redis and continues processing pending jobs
- **Idempotency** - Job IDs prevent duplicate sends

### Rate Limiting Implementation

- **Redis-based counters** - Key: `rate_limit:{sender}:{YYYY-MM-DD-HH}`
- **Atomic operations** - INCR command ensures thread-safety
- **Auto-expiry** - Keys expire after 1 hour
- **Rescheduling** - When limit hit, job delayed to next hour window

### Concurrency

- **Worker concurrency**: 5 (configurable via `WORKER_CONCURRENCY`)
- **Min delay between emails**: 2000ms (configurable via `MIN_DELAY_BETWEEN_EMAILS_MS`)
- **BullMQ limiter** - Ensures delays are respected across workers

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Emails
- `POST /api/emails/schedule` - Schedule emails
- `GET /api/emails/scheduled` - Get scheduled emails
- `GET /api/emails/sent` - Get sent emails

## 🚀 Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `SESSION_SECRET`
   - Configure real SMTP provider
   - Update `FRONTEND_URL` and callback URLs

2. **Database**
   - Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
   - Run migrations: `npx prisma migrate deploy`

3. **Redis**
   - Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
   - Enable persistence (AOF/RDB)

4. **Scaling**
   - Run multiple worker instances
   - Rate limiting is safe across instances (Redis-based)
   - Use load balancer for API

## 📄 License

MIT

## 👤 Author

Built for ReachInbox Assignment

---

**Note**: This is a demonstration project for the ReachInbox hiring assignment. It showcases production-grade patterns for email scheduling, rate limiting, and job queue management.
