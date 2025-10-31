# 🚀 Quick Run Guide

Get Baby Pet App running in **5 minutes**!

## Prerequisites Check

```bash
node --version    # Need 20+
python3 --version # Need 3.11+
docker --version  # Optional but recommended
```

## One-Command Setup

```bash
chmod +x SETUP.sh
./SETUP.sh
```

This will:
- Install all dependencies
- Build shared types
- Start Docker services (Postgres, Redis, S3)
- Set up database with migrations
- Create test user
- Set up Python environment

## Start Development

### Option 1: All Services (Recommended)

```bash
# Terminal 1 - API + Mobile
npm run dev
```

```bash
# Terminal 2 - GPU Worker
npm run dev:gpu
```

### Option 2: Individual Services

```bash
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - GPU Worker
npm run dev:gpu

# Terminal 3 - Mobile App
npm run dev:mobile

# Terminal 4 - Queue Worker (optional, processes jobs)
npm run dev:worker
```

## Quick Test

1. **Open Mobile App**:
   - iOS Simulator: Press `i`
   - Android Emulator: Press `a`
   - Physical Device: Scan QR code with Expo Go

2. **Select pet type** (Cat/Dog)

3. **Pick photos** (3-6 images)

4. **Generate!** ✨

## Test User

The setup script creates a test user with 3 free credits:

```
User ID: test-user-123
Email: test@babypet.app
Credits: 3
```

The mobile app uses header `x-user-id: test-user-123` automatically.

## API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Readiness (checks DB + Redis)
curl http://localhost:3000/ready

# tRPC endpoints
http://localhost:3000/trpc
```

## Database GUI

```bash
npm run prisma:studio
```

Opens at http://localhost:5555

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if Postgres is running
docker ps | grep postgres

# Or start it manually
docker-compose -f infra/docker-compose.yml up postgres -d
```

### "Cannot connect to Redis"
```bash
# Check if Redis is running
docker ps | grep redis

# Or start it manually
docker-compose -f infra/docker-compose.yml up redis -d
```

### "Module not found" errors
```bash
# Rebuild types package
npm run build:types
```

### Mobile app can't reach API
```bash
# Find your local IP
# Windows:
ipconfig

# Mac/Linux:
ifconfig | grep "inet "

# Update apps/mobile/.env:
# API_URL=http://YOUR_IP:3000
```

### GPU worker fails
```bash
# Make sure venv is activated
cd services/worker-gpu
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

## Environment Variables

### API (`services/api/.env`)

**Required:**
- `DATABASE_URL` - Postgres connection string
- `REDIS_HOST` - Redis host
- `S3_BUCKET` - S3 bucket name

**Optional:**
- `SENTRY_DSN` - Error tracking
- `GPU_WORKER_URL` - GPU service URL

### Mobile (`apps/mobile/.env`)

**Required:**
- `API_URL` - Backend API URL

## Docker Services

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Just Postgres
docker-compose -f infra/docker-compose.yml up postgres -d

# Just Redis
docker-compose -f infra/docker-compose.yml up redis -d

# Just LocalStack (S3)
docker-compose -f infra/docker-compose.yml up localstack -d
```

## Useful Commands

```bash
# Reset database (⚠️  Deletes all data)
npm run prisma:reset

# Create new migration
cd services/api
npx prisma migrate dev --name add_feature

# Seed database again
npm run prisma:seed

# Clean install (if things are broken)
npm run clean
npm install
npm run setup
```

## What's Running?

After `npm run dev`:

| Service | Port | URL |
|---------|------|-----|
| API Server | 3000 | http://localhost:3000 |
| GPU Worker | 5000 | http://localhost:5000 |
| Mobile (Expo) | 8081 | http://localhost:8081 |
| Postgres | 5432 | postgresql://localhost:5432 |
| Redis | 6379 | redis://localhost:6379 |
| LocalStack S3 | 4566 | http://localhost:4566 |
| Prisma Studio | 5555 | http://localhost:5555 |

## Next Steps

1. ✅ App is running!
2. 📱 Test the upload → generate → result flow
3. 🎨 Customize the UI (apps/mobile/src/app/)
4. 🤖 Add real AI model (services/worker-gpu/pipeline.py)
5. 🔐 Add authentication (Clerk or Auth.js)
6. 💳 Configure IAP (RevenueCat)
7. 🚀 Deploy to production (see DEPLOYMENT.md)

## Common Tasks

### Add New API Endpoint

1. Add schema to `packages/types/src/schemas.ts`
2. Add route to `services/api/src/trpc/router.ts`
3. TypeScript types auto-generated! ✨

### Add New Mobile Screen

1. Create `apps/mobile/src/app/newscreen.tsx`
2. Auto-routed by Expo Router!
3. Navigate: `router.push('/newscreen')`

### Update Database Schema

1. Edit `services/api/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Prisma Client auto-updated! ✨

## Getting Help

- **Architecture**: See ARCHITECTURE.md
- **Full setup**: See QUICKSTART.md
- **TODOs**: See TODO.md
- **Deployment**: See DEPLOYMENT.md

---

**Happy coding! 🐾**

