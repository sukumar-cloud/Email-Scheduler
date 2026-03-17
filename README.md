# Distributed Email Scheduling Platform

A production-grade platform for scheduling and sending emails at precise times, featuring persistent job queues, rate limiting, and a modern dashboard interface.

---

## 🚀 Overview

This system allows users to schedule emails with high reliability using a distributed queue-based architecture.

### Key Capabilities

* Delayed job scheduling using queues
* Rate limiting per sender
* Fault-tolerant processing
* Persistent job storage across restarts
* Scalable worker-based execution

---

## 🛠 Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL (Prisma ORM)
* Redis (BullMQ)

### Frontend

* React (Vite)

### Infrastructure

* Docker & Docker Compose

---

## ⚙️ How It Works

1. Users schedule emails via the frontend (CSV upload supported)
2. Backend stores email metadata in PostgreSQL
3. BullMQ queues delayed jobs in Redis
4. Worker processes jobs at scheduled time:

   * Applies rate limiting
   * Sends emails via SMTP
   * Updates delivery status in database

---

## 🔄 Core Features

### ⏱ Scheduling & Queue System

* Uses BullMQ for reliable delayed job execution
* Jobs persist across restarts via Redis

### 🚦 Rate Limiting

* Redis-based counters using atomic operations (`INCR`)
* Per-sender hourly limits enforced
* Automatic rescheduling when limits are exceeded

### ⚡ Concurrency & Workers

* Configurable worker concurrency
* Distributed processing support
* Fault-tolerant retry mechanisms

### 🔁 Idempotency & Persistence

* Prevents duplicate email sends
* Job states persist across system restarts

---

## 🔐 Authentication

* Google OAuth 2.0 integration
* Session-based authentication
* Secure credential handling via environment variables

---

## 📡 API Endpoints

### Authentication

* `GET /api/auth/google`
* `GET /api/auth/google/callback`
* `GET /api/auth/me`
* `POST /api/auth/logout`

### Emails

* `POST /api/emails/schedule`
* `GET /api/emails/scheduled`
* `GET /api/emails/sent`

---

## ⚙️ Setup Instructions

### Prerequisites

* Node.js 18+
* Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd project-folder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Start Infrastructure

```bash
docker-compose up -d
```

### Run Application

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

---

## 🔧 Environment Variables

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=your_postgresql_connection

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=3001
NODE_ENV=production

SESSION_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

FRONTEND_URL=http://localhost:3000

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

MAX_EMAILS_PER_HOUR_PER_SENDER=100
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_EMAILS_MS=2000
```

---

## 🚀 Deployment Notes

* Use managed PostgreSQL and Redis services
* Run multiple worker instances for scalability
* Configure secure environment variables
* Use HTTPS and correct OAuth redirect URLs

---

## 🎯 Key Highlights

* Distributed queue-based architecture
* Scalable worker system with concurrency control
* Reliable rate limiting using Redis
* Persistent and fault-tolerant job execution
* Production-ready backend design

---

## 👨‍💻 Author

Built as a backend-focused project demonstrating distributed systems, queue processing, and scalable architecture.
