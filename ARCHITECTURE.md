# Baby Pet App - Architecture

## Overview

TypeScript-first monorepo with Python GPU worker for high-quality image generation.

## Tech Stack

### Mobile App (`apps/mobile`)
- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **API**: tRPC client
- **IAP**: RevenueCat (Phase 1) → Native StoreKit 2 + Play Billing (Phase 2)
- **Image Picker**: expo-image-picker, react-native-vision-camera

### Backend API (`services/api`)
- **Server**: Fastify
- **API Layer**: tRPC (end-to-end type-safe)
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **Storage**: S3 (or Cloudflare R2)
- **Auth**: Header-based (upgrade to Clerk/Auth.js)
- **Observability**: Sentry

### GPU Worker (`services/worker-gpu`)
- **Language**: Python 3.11+
- **Framework**: Flask (simple HTTP API)
- **AI**: PyTorch + Diffusers (SDXL + IP-Adapter + LoRA)
- **Image Processing**: OpenCV, Pillow
- **Deployment**: Modal, RunPod, or AWS GPU instances

### Shared Types (`packages/types`)
- Zod schemas for validation
- tRPC contracts
- Shared TypeScript types

## Data Flow

```
┌─────────────┐     Upload      ┌──────────────┐
│  Mobile App │────────────────>│  S3 Bucket   │
└─────────────┘                 └──────────────┘
       │                                │
       │ POST /trpc/createJob           │
       ▼                                │
┌─────────────┐     Enqueue     ┌──────▼───────┐
│  API Server │────────────────>│ Redis/BullMQ │
└─────────────┘                 └──────────────┘
       │                                │
       │                        ┌───────▼────────┐
       │                        │  Worker Queue  │
       │                        │  (TS Bridge)   │
       │                        └───────┬────────┘
       │                                │ HTTP POST
       │                        ┌───────▼────────┐
       │                        │  GPU Worker    │
       │                        │  (Python)      │
       │                        └───────┬────────┘
       │                                │
       │<─────────────────────────────┘
       │         Callback /internal/worker-callback
       │
       ▼
┌─────────────┐
│  Push Notif │
└─────────────┘
```

## Directory Structure

```
baby-pet-app/
├── apps/
│   └── mobile/              # Expo React Native app
│       ├── src/
│       │   ├── app/         # Expo Router pages
│       │   ├── store/       # Zustand stores
│       │   └── utils/       # tRPC client
│       └── app.json
│
├── services/
│   ├── api/                 # Fastify + tRPC backend
│   │   ├── prisma/          # Database schema
│   │   └── src/
│   │       ├── services/    # Business logic
│   │       ├── trpc/        # tRPC router
│   │       └── queue.ts     # BullMQ setup
│   │
│   └── worker-gpu/          # Python GPU worker
│       ├── pipeline.py      # Diffusion pipeline
│       ├── s3_utils.py      # S3 I/O
│       └── app.py           # Flask API
│
├── packages/
│   └── types/               # Shared Zod schemas + types
│       └── src/
│           ├── schemas.ts   # Zod validation
│           ├── enums.ts     # Enums
│           └── types.ts     # TypeScript types
│
└── infra/
    └── docker-compose.yml   # Local dev stack
```

## Key Features

### 1. Identity-Preserving Generation
- Use **IP-Adapter** to encode pet's visual identity from 3-6 reference images
- Apply **age-down LoRA** (kitten/puppy style) to transform adult → baby
- Optional breed-specific LoRAs for better results

### 2. Compliance (GDPR, CCPA, App Stores)
- ✅ **Data Deletion** (`/trpc/requestDeletion`) - GDPR Art. 17
- ✅ **Data Export** (`/trpc/requestExport`) - GDPR Art. 15
- ✅ **People Guardrail** - Reject images with human faces
- ✅ **Auto-deletion** - Remove original photos after 72h
- ✅ **Privacy Policy** - Required for App Store & Play Store

### 3. Payments & Entitlements
- **Free Tier**: 1 watermarked image
- **Consumables**: Per-image credits ($0.99-$1.99)
- **Subscription**: Monthly unlimited ($4.99/month)
- **Platform**: RevenueCat (Phase 1) → Native IAP (Phase 2)

### 4. Queue & Workers
- **BullMQ** handles job queue with retries and rate limiting
- **TypeScript worker** dispatches to Python GPU service via HTTP
- **Python worker** runs diffusion model and uploads result to S3
- **Callback** notifies API server when job completes

## Security & Privacy

### Image Storage
- Originals: Auto-delete after 72h (configurable)
- Results: Keep indefinitely (user owns them)
- S3 bucket: Separate folders for inputs/results
- Presigned URLs: Time-limited access (1 hour)

### People Detection Guardrail
- Reject images containing human faces/bodies
- Protects against biometric/likeness issues
- Reduces legal/ethical risk

### Data Retention
- Jobs: Keep metadata, delete input images
- Users: Full deletion on request (GDPR Art. 17)
- Exports: JSON + download link (GDPR Art. 15)

## Deployment

### Development
```bash
# Start local stack
docker-compose up -d

# API + Mobile
npm install
npm run prisma:migrate
npm run dev
```

### Production
- **API**: Fly.io, Railway, or AWS ECS
- **Database**: Managed PostgreSQL (RDS, Supabase)
- **Redis**: Managed Redis (Upstash, Redis Cloud)
- **GPU Worker**: Modal, RunPod, or AWS GPU instances
- **Storage**: S3, Cloudflare R2
- **CDN**: CloudFront, Cloudflare

## Observability

- **Errors**: Sentry (API + Mobile)
- **Logs**: OpenTelemetry → CloudWatch/Datadog
- **Metrics**: Job success rate, processing time, queue depth
- **Alerts**: Job failures, queue backlog, API errors

## Next Steps

1. ✅ Core skeleton (tRPC, Fastify, Prisma, Python worker)
2. 🔄 RevenueCat IAP integration
3. 🔄 People-detector guardrail (MediaPipe/YOLO)
4. 🔄 Actual diffusion pipeline (IP-Adapter + LoRA)
5. 🔄 Push notifications (Expo Notifications)
6. 🔄 Auth (Clerk or Auth.js)
7. 🔄 Production deployment configs

## Compliance Checklist

- [ ] Privacy Policy (public URL)
- [ ] Terms of Service
- [ ] App Store Privacy Nutrition Labels
- [ ] Google Play Data Safety form
- [ ] Account deletion web page (required by Google Play)
- [ ] GDPR data subject request workflow
- [ ] CCPA/CPRA compliance documentation
- [ ] Server-side IAP receipt verification
- [ ] Subscription cancellation flow
- [ ] Breach notification plan

