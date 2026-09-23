# Pehenlo Backend

Express + MongoDB API scaffold for the Pehenlo rental marketplace.

## Prerequisites

- Node.js 18+
- MongoDB (optional for initial structure verification)

## Setup

```bash
cd backend
cp .env.example .env   # if .env does not exist
npm install
```

Edit `.env` with your local values. Do not commit real secrets.

## Run

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server listens on `PORT` (default `5000`). MongoDB connection failures are logged but do not stop the server.

## Health check

```bash
curl http://localhost:5000/health
```

## API base path

All routes are mounted under `/api/v1`:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/categories`
- `/api/v1/listings`
- `/api/v1/bookings`
- `/api/v1/payments`
- `/api/v1/earnings`
- `/api/v1/reviews`
- `/api/v1/wishlist`
- `/api/v1/notifications`
- `/api/v1/disputes`
