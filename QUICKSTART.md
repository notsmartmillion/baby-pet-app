# Quick Start Guide 🚀

Get your Baby Pet App running locally in 10 minutes!

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for local stack)

## Option 1: Docker (Recommended)

```bash
# 1. Start infrastructure (Postgres, Redis, LocalStack S3)
cd infra
docker-compose up -d

# 2. Install dependencies
cd ..
npm install

# 3. Set up database
cd services/api
cp .env.example .env
# Edit .env with your settings
npm run prisma:migrate

# 4. Start API server
npm run dev

# 5. Start Python worker (new terminal)
cd services/worker-gpu
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py

# 6. Start mobile app (new terminal)
cd apps/mobile
npm start
```

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb babypet

# Configure environment
cd services/api
cp .env.example .env
# Edit DATABASE_URL in .env

# Run migrations
npm run prisma:migrate
```

### 3. Set Up Redis

```bash
# Make sure Redis is running
redis-server
```

### 4. Set Up S3 (Development)

Option A: Use LocalStack
```bash
docker run -d -p 4566:4566 localstack/localstack
```

Option B: Use AWS S3
- Create an S3 bucket
- Get AWS credentials
- Update `.env` with credentials

### 5. Start Services

**Terminal 1 - API Server:**
```bash
cd services/api
npm run dev
```

**Terminal 2 - GPU Worker:**
```bash
cd services/worker-gpu
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

**Terminal 3 - Mobile App:**
```bash
cd apps/mobile
npm start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app
```

## Testing the Flow

1. **Open the mobile app**
   - Select "Cat" or "Dog"
   - Pick 3-6 photos (for now, any images work)

2. **Generate**
   - Tap "Generate Baby Pet"
   - Watch the job status update

3. **View result**
   - When completed, see the result image
   - Free tier has watermark

## Troubleshooting

### API won't start
- Check PostgreSQL is running: `psql -U postgres -l`
- Check Redis is running: `redis-cli ping`
- Verify `.env` file exists and has correct values

### Mobile app can't connect to API
- Update `apps/mobile/app.json` → `extra.apiUrl` with your machine's IP
- If using Expo Go, API must be accessible from your device
- On Windows: `ipconfig` → use IPv4 address
- On macOS: `ifconfig` → use en0 inet address

### Python worker errors
- Activate venv first: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
- Check Python version: `python --version` (should be 3.11+)
- GPU not required for development (stubs work without GPU)

### Database migrations fail
- Drop and recreate: `npm run prisma:migrate reset`
- Or manually: `dropdb babypet && createdb babypet`

## Next Steps

1. **Add real diffusion model** (`services/worker-gpu/pipeline.py`)
   - Load SDXL + IP-Adapter
   - Add kitten/puppy LoRAs
   - Implement actual generation

2. **Add auth** 
   - Integrate Clerk or Auth.js
   - Replace `x-user-id` header with JWT

3. **Add IAP**
   - Install `@revenuecat/purchases-react-native`
   - Configure products in App Store Connect / Google Play Console
   - Update `apps/mobile/src/app/purchase.tsx`

4. **Deploy**
   - API: Fly.io, Railway, or AWS
   - GPU Worker: Modal, RunPod, or AWS GPU
   - Database: Managed PostgreSQL
   - Redis: Upstash or Redis Cloud

## Useful Commands

```bash
# Monorepo
npm run dev              # Start API + mobile concurrently
npm run mobile           # Start mobile app only
npm run api              # Start API server only

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio (GUI)

# Types
cd packages/types && npm run build  # Build shared types

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Development Tips

- Use Prisma Studio to inspect database: `npm run prisma:studio`
- Monitor Redis queue: `redis-cli MONITOR`
- Check API health: `curl http://localhost:3000/health`
- Check GPU worker health: `curl http://localhost:5000/health`
- tRPC DevTools: Install browser extension for debugging

## Need Help?

- Check `ARCHITECTURE.md` for system design
- Check `README.md` for product overview
- Review `services/api/src/trpc/router.ts` for API contracts
- Review `packages/types/src/schemas.ts` for data structures

