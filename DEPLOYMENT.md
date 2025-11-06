# Deployment Guide 🚀

Production deployment options for Kittypup.

## Architecture Overview

```
Mobile App → API Server → BullMQ → Worker (TS) → GPU Worker (Python) → S3
             ↓
        PostgreSQL
             ↓
           Redis
```

---

## Recommended Stack

### Mobile App
**Platform**: Expo EAS Build + App Store / Google Play
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
cd apps/mobile
eas build:configure

# Build for stores
eas build --platform ios
eas build --platform android

# Submit
eas submit --platform ios
eas submit --platform android
```

### API Server
**Platform**: Fly.io (recommended) or Railway

**Why Fly.io:**
- Close to Postgres + Redis
- Multi-region deployment
- Built-in load balancing
- Excellent TypeScript support

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create app
cd services/api
fly launch

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set REDIS_HOST="..."
fly secrets set AWS_ACCESS_KEY_ID="..."
fly secrets set AWS_SECRET_ACCESS_KEY="..."

# Deploy
fly deploy
```

**fly.toml** (create in `services/api/`):
```toml
app = "kittypup-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[[services]]
  http_checks = []
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  max_machines_running = 10
```

### Database
**Platform**: Fly.io Postgres or Supabase

**Option 1: Fly Postgres**
```bash
fly postgres create --name kittypup-db
fly postgres attach --app kittypup-api kittypup-db
```

**Option 2: Supabase**
- Create project at supabase.com
- Get connection string
- Set `DATABASE_URL` secret

### Redis
**Platform**: Upstash (serverless) or Fly Redis

**Option 1: Upstash (recommended for simple setup)**
- Create database at upstash.com
- Get connection string
- Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

**Option 2: Fly Redis**
```bash
fly redis create --name kittypup-redis
# Note connection details, set as secrets
```

### GPU Worker
**Platform**: Modal (recommended) or RunPod

**Why Modal:**
- Serverless GPU
- Auto-scaling
- Pay per second
- Built-in container management

**Modal Setup:**
```python
# services/worker-gpu/modal_app.py
import modal

stub = modal.Stub("kittypup-gpu")

# Define GPU image with dependencies
image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")

@stub.function(
    image=image,
    gpu="T4",  # Or A10G, A100
    timeout=300,
    secrets=[modal.Secret.from_name("aws-credentials")]
)
def generate_baby_pet(job_data):
    from pipeline import generate_baby_pet
    return generate_baby_pet(**job_data)

@stub.webhook(method="POST")
def webhook(job_data: dict):
    result = generate_baby_pet.call(job_data)
    return {"success": True, "result": result}
```

```bash
# Deploy to Modal
cd services/worker-gpu
modal deploy modal_app.py

# Get webhook URL
modal token set --token-id xxx --token-secret yyy
```

**Alternative: RunPod**
- Create serverless endpoint
- Upload Docker image
- Set webhook URL in API

### Storage
**Platform**: AWS S3 or Cloudflare R2

**AWS S3:**
```bash
aws s3 mb s3://kittypup-uploads
aws s3api put-bucket-encryption \
  --bucket kittypup-uploads \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**Cloudflare R2** (cheaper, S3-compatible):
- Create bucket in Cloudflare dashboard
- Get access keys
- Use S3 SDK with custom endpoint

---

## Environment Variables

### API Server (`services/api/.env`)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/kittypup"
REDIS_HOST="redis.fly.dev"
REDIS_PORT=6379
REDIS_PASSWORD="xxx"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
S3_BUCKET="kittypup-uploads"
GPU_WORKER_URL="https://xxx.modal.run"
SENTRY_DSN="https://xxx@sentry.io/xxx"
API_SECRET="xxx"
```

### GPU Worker (`services/worker-gpu/.env`)
```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
S3_BUCKET="kittypup-uploads"
MODEL_PATH="/models"
```

### Mobile App (`apps/mobile/app.json`)
```json
{
  "extra": {
    "apiUrl": "https://kittypup-api.fly.dev"
  }
}
```

---

## Scaling Strategy

### Small Scale (< 1K users)
- API: 1 machine (Fly.io)
- Database: Shared Postgres
- Redis: Shared instance
- GPU: Modal serverless (auto-scales)
- Cost: ~$50-100/month

### Medium Scale (1K-10K users)
- API: 2-5 machines, auto-scaling
- Database: Dedicated Postgres (2GB RAM)
- Redis: Dedicated instance
- GPU: Modal + reserved instances for peak times
- Cost: ~$200-500/month

### Large Scale (10K+ users)
- API: 10+ machines, multi-region
- Database: HA Postgres with replicas
- Redis: Cluster mode
- GPU: Dedicated GPU cluster (K8s + AWS) or Modal at scale
- CDN: CloudFront for S3
- Cost: $1K+/month

---

## Monitoring & Observability

### Sentry (Errors)
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging
- API: JSON logs → CloudWatch / Datadog
- GPU: Python logging → same
- Use structured logging with request IDs

### Metrics
Track:
- Job success rate
- Average processing time
- Queue depth
- S3 storage size
- Credit usage
- Revenue (MRR)

### Alerts
- Job failure rate > 5%
- Queue depth > 100
- API error rate > 1%
- GPU worker down

---

## CI/CD Pipeline

### GitHub Actions (included in `.github/workflows/ci.yml`)

**On push to main:**
1. Run tests
2. Build Docker images
3. Deploy API to Fly.io
4. Deploy GPU worker to Modal

**Manual deployment:**
```bash
# API
cd services/api
fly deploy

# GPU Worker
cd services/worker-gpu
modal deploy modal_app.py

# Mobile (manual via EAS)
cd apps/mobile
eas build --platform all
```

---

## Security Checklist

- [ ] Use environment variables for secrets (never commit)
- [ ] Enable HTTPS only (Fly.io does this automatically)
- [ ] Encrypt S3 bucket at rest (AES256)
- [ ] Use presigned URLs (time-limited)
- [ ] Rate limit API endpoints (Fastify rate-limit plugin)
- [ ] Validate all inputs (Zod schemas)
- [ ] Sanitize user uploads (strip EXIF)
- [ ] Implement CSRF protection
- [ ] Set up WAF (Cloudflare) if using custom domain
- [ ] Enable MFA for AWS/cloud accounts
- [ ] Rotate secrets quarterly
- [ ] Regular dependency updates (Dependabot)

---

## Database Migrations

**Development:**
```bash
npm run prisma:migrate
```

**Production:**
```bash
# Fly.io
fly ssh console -a kittypup-api
cd /app/services/api
npx prisma migrate deploy
```

**Best practice:**
- Run migrations in CI/CD before deployment
- Keep migrations backward-compatible
- Test migrations on staging first

---

## Cron Jobs

Set up these scheduled tasks:

**1. Cleanup expired images (daily)**
```bash
# Fly.io: Use fly-cron or external cron service
0 2 * * * curl https://kittypup-api.fly.dev/internal/cleanup
```

Or use GitHub Actions:
```yaml
# .github/workflows/cleanup.yml
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://kittypup-api.fly.dev/internal/cleanup
```

**2. Process pending deletion requests (hourly)**

---

## Backup Strategy

### Database
- Fly Postgres: Automatic daily backups
- Supabase: Point-in-time recovery
- Manual: `pg_dump` weekly to S3

### S3
- Enable versioning
- Lifecycle policy: move to Glacier after 90 days
- Cross-region replication (optional)

---

## Cost Optimization

1. **Compress images**: Use WebP, reduce resolution
2. **CDN**: CloudFront for S3 (cheaper egress)
3. **GPU**: Use smaller models (SDXL → SD 1.5 if acceptable)
4. **Auto-scaling**: Fly.io auto-stop during low traffic
5. **S3**: Lifecycle policy to delete old jobs
6. **Database**: Regular VACUUM, index optimization

---

## Disaster Recovery

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 24 hours

**Runbook:**
1. Database down → Restore from backup
2. API down → Redeploy from GitHub
3. GPU worker down → Restart Modal function
4. S3 data loss → Restore from versioning/backup

**Test recovery quarterly.**

---

## Launch Checklist

- [ ] Deploy API to production
- [ ] Deploy GPU worker
- [ ] Set up managed Postgres + Redis
- [ ] Create S3 bucket with encryption
- [ ] Configure domain + SSL
- [ ] Set up monitoring (Sentry, logs)
- [ ] Create cron jobs (cleanup)
- [ ] Test full user flow (upload → generate → download)
- [ ] Load test API (100+ concurrent users)
- [ ] Build and submit mobile apps (EAS)
- [ ] Set up App Store + Play Store listings
- [ ] Configure IAP products
- [ ] Write Privacy Policy + ToS
- [ ] Fill out app store privacy labels
- [ ] Test IAP purchases (sandbox)
- [ ] Set up customer support email
- [ ] Prepare marketing assets
- [ ] Soft launch to beta testers
- [ ] Monitor for 1 week
- [ ] Full public launch 🚀

---

## Post-Launch

- Monitor error rates daily
- Respond to user feedback
- Iterate on model quality
- Add features (e.g., video, more breeds)
- Scale infrastructure as needed
- Update privacy labels when adding features
- Regular security audits
- Celebrate success! 🎉

