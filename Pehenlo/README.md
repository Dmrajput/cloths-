# Pehenlo

Peer-to-peer traditional clothing rental marketplace.

Users can browse, search, and rent traditional outfits, list their own garments, manage bookings, track earnings, and review renters/owners.

## Applications

| App | Stack | Path |
|-----|--------|------|
| Mobile | React Native + Expo (JavaScript) | `mobile/` |
| Backend API | Node.js + Express + MongoDB | `backend/` |
| Admin Panel | React + Vite (JavaScript) | `admin/` |

## Getting started

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Expo Go (for mobile testing)

### Install dependencies

```bash
cd Pehenlo
npm run install:all
```

Or install each app separately:

```bash
cd mobile && npm install
cd ../backend && npm install
cd ../admin && npm install
```

### Environment

Copy example env files and fill in values (never commit real secrets):

```bash
cp backend/.env.example backend/.env
# Edit mobile/.env, backend/.env, and admin/.env as needed
```

### Start apps

**Mobile**

```bash
cd mobile
npm start
```

**Backend**

```bash
cd backend
npm run dev
```

**Admin**

```bash
cd admin
npm run dev
```

From the monorepo root you can also use `npm run mobile`, `npm run backend`, or `npm run admin`.

## API

REST API is versioned under `/api/v1`.

## License

UNLICENSED — private project.
