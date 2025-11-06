# Kittypup - TODO List 📋

Complete checklist of tasks to go from skeleton → production-ready app.

---

## 🔥 Phase 1: MVP (Core Functionality)

### AI Pipeline (Critical Path)
- [ ] **Load actual diffusion models** (`services/worker-gpu/pipeline.py`)
  - [ ] Download/purchase SDXL base model
  - [ ] Integrate IP-Adapter for identity preservation
  - [ ] Create or find kitten/puppy age-down LoRA
  - [ ] Test with sample pet images
  - [ ] Optimize inference speed (target: 10-20s per image)

- [ ] **Implement pet segmentation** (`services/worker-gpu/pipeline.py`)
  - [ ] Choose solution (SAM, RemBG, or custom model)
  - [ ] Integrate into pipeline
  - [ ] Handle edge cases (multiple pets, cluttered backgrounds)
  - [ ] Test accuracy on various pet photos

- [ ] **People detection guardrail** (`services/worker-gpu/pipeline.py`)
  - [ ] Choose solution: MediaPipe, YOLOv8, or cloud API
  - [ ] Implement `detect_people()` function
  - [ ] Test false positive/negative rates
  - [ ] Add user-friendly error message

- [ ] **Model optimization**
  - [ ] Enable xFormers for memory efficiency
  - [ ] Add model caching (avoid reload on every request)
  - [ ] Test on target GPU (T4, A10G, or A100)
  - [ ] Benchmark: throughput, cost per image

### Authentication
- [ ] **Choose auth provider** (Clerk recommended, or Auth.js)
  - [ ] Sign up for service
  - [ ] Install SDK in mobile app
  - [ ] Configure Sign in with Apple (iOS requirement)
  - [ ] Configure Google Sign-In
  - [ ] Add "Guest mode" → upgrade flow

- [ ] **Backend auth integration** (`services/api/src/trpc/context.ts`)
  - [ ] Replace `x-user-id` header with JWT verification
  - [ ] Add middleware to validate tokens
  - [ ] Auto-create user on first login
  - [ ] Test token refresh flow

### In-App Purchases
- [ ] **Configure IAP products**
  - [ ] Create App Store Connect account
  - [ ] Create Google Play Console account
  - [ ] Define product IDs (credit_5, credit_10, monthly_unlimited)
  - [ ] Set prices (localized)
  - [ ] Create test products for sandbox

- [ ] **Integrate RevenueCat** (`apps/mobile/src/app/purchase.tsx`)
  - [ ] Sign up for RevenueCat
  - [ ] Install `@revenuecat/purchases-react-native`
  - [ ] Configure API keys (iOS + Android)
  - [ ] Implement purchase flow
  - [ ] Test in sandbox (iOS + Android)

- [ ] **Server-side receipt verification** (`services/api/src/services/iapService.ts`)
  - [ ] Implement Apple StoreKit 2 verification
  - [ ] Implement Google Play Billing verification
  - [ ] Add webhook endpoint for RevenueCat
  - [ ] Test webhook delivery and retry logic

### Push Notifications
- [ ] **Set up Expo Notifications**
  - [ ] Configure APNs (Apple Push Notification service)
  - [ ] Configure FCM (Firebase Cloud Messaging)
  - [ ] Request permissions in app
  - [ ] Store device tokens in database

- [ ] **Send notifications** (`services/api/src/services/jobService.ts`)
  - [ ] Job completed → "Your baby pet is ready! 🐾"
  - [ ] Job failed → "Oops, something went wrong"
  - [ ] Purchase confirmed → "Credits added!"
  - [ ] Test notification delivery

### Testing
- [ ] **End-to-end flow test**
  - [ ] Upload → generate → download
  - [ ] Free tier (watermarked)
  - [ ] Paid tier (no watermark)
  - [ ] Error handling (bad images, network errors)

- [ ] **Load testing**
  - [ ] 10 concurrent users
  - [ ] 100 concurrent users
  - [ ] Measure: response times, error rates, GPU queue depth

---

## 📝 Phase 2: Compliance & Legal

### Privacy Policy
- [ ] **Write Privacy Policy**
  - [ ] Use template (iubenda, Termly, or lawyer)
  - [ ] Customize for your data practices
  - [ ] Host at public URL (e.g., yourapp.com/privacy)
  - [ ] Link in mobile app (Settings screen)
  - [ ] Link in app store listings

- [ ] **Privacy Policy must include:**
  - [ ] What data you collect (photos, email, device ID)
  - [ ] Why you collect it (generate baby pets)
  - [ ] How long you keep it (72h for originals)
  - [ ] Third parties (AWS, Apple/Google)
  - [ ] User rights (delete, export, opt-out)
  - [ ] Contact email for data requests
  - [ ] International transfers (if EU users)

### Terms of Service
- [ ] **Write Terms of Service**
  - [ ] Use template or hire lawyer
  - [ ] Host at public URL
  - [ ] Link in mobile app
  - [ ] Link in app store listings

- [ ] **ToS must include:**
  - [ ] Acceptable use (pet photos only, no people)
  - [ ] License grant (to process photos)
  - [ ] Ownership (user owns generated images)
  - [ ] Liability limitations
  - [ ] Subscription terms (billing, cancellation, refunds)
  - [ ] Dispute resolution

### App Store Privacy Labels
- [ ] **Fill out Apple App Privacy** (App Store Connect)
  - [ ] Data Types: Photos, Purchase History, Device ID
  - [ ] Purposes: App Functionality, Analytics (if used)
  - [ ] Tracking: Select "No" (unless you add ads/attribution)
  - [ ] Third Parties: AWS (storage), Apple (payments)

- [ ] **Fill out Google Play Data Safety** (Play Console)
  - [ ] Same categories as Apple
  - [ ] Data sharing: Service providers only
  - [ ] Data security: Encrypted in transit and at rest
  - [ ] Account deletion: Link to web form + in-app

### Account Deletion
- [ ] **Create web-based deletion form** (Google Play requirement)
  - [ ] Simple HTML page with email input
  - [ ] POST to `/api/delete-account` endpoint
  - [ ] Host at yourapp.com/delete-account
  - [ ] Link in Google Play Console → Data Safety

- [ ] **Test deletion flow**
  - [ ] In-app deletion button works
  - [ ] Web form deletion works
  - [ ] All data actually deleted (verify in DB + S3)
  - [ ] User receives confirmation email

### Data Export
- [ ] **Implement data export** (`services/api/src/services/complianceService.ts`)
  - [ ] Generate JSON with all user data
  - [ ] Include: profile, jobs, images, purchases
  - [ ] Upload to S3 with presigned URL
  - [ ] Send email with download link
  - [ ] Test export completeness

### Auto-Deletion Cron Job
- [ ] **Set up scheduled cleanup** (`scripts/cleanup-expired-images.ts`)
  - [ ] Run daily (via GitHub Actions, cron, or scheduler)
  - [ ] Delete input images older than 72h
  - [ ] Log deletions for audit trail
  - [ ] Monitor: ensure it's running

---

## 🚀 Phase 3: Deployment

### Infrastructure Setup
- [ ] **Database (PostgreSQL)**
  - [ ] Choose provider: Fly.io, Supabase, or AWS RDS
  - [ ] Create production database
  - [ ] Run migrations: `npx prisma migrate deploy`
  - [ ] Set up daily backups
  - [ ] Configure connection pooling

- [ ] **Redis**
  - [ ] Choose provider: Upstash, Fly Redis, or AWS ElastiCache
  - [ ] Create production instance
  - [ ] Configure persistence (AOF + RDB)
  - [ ] Set up monitoring

- [ ] **S3 Storage**
  - [ ] Create production bucket
  - [ ] Enable encryption at rest (AES256)
  - [ ] Enable versioning (for data recovery)
  - [ ] Set up lifecycle policy (optional: move to Glacier after 90 days)
  - [ ] Configure CORS (for direct uploads)

### API Deployment
- [ ] **Deploy to Fly.io** (or Railway)
  - [ ] Install flyctl CLI
  - [ ] Run `fly launch` in `services/api/`
  - [ ] Configure `fly.toml` (see DEPLOYMENT.md)
  - [ ] Set secrets (DATABASE_URL, REDIS_*, AWS_*, etc.)
  - [ ] Deploy: `fly deploy`
  - [ ] Test health endpoint

- [ ] **Configure custom domain** (optional)
  - [ ] Buy domain (Namecheap, Cloudflare)
  - [ ] Point to Fly.io: `fly certs add api.yourapp.com`
  - [ ] Enable SSL (automatic with Fly.io)

### GPU Worker Deployment
- [ ] **Deploy to Modal** (recommended)
  - [ ] Sign up at modal.com
  - [ ] Install Modal CLI: `pip install modal`
  - [ ] Set secrets: `modal secret create aws-credentials`
  - [ ] Deploy: `modal deploy services/worker-gpu/modal_app.py`
  - [ ] Get webhook URL
  - [ ] Update API's `GPU_WORKER_URL` environment variable

- [ ] **Alternative: RunPod**
  - [ ] Create serverless endpoint
  - [ ] Build and push Docker image
  - [ ] Configure webhook
  - [ ] Test cold start times

### Mobile App Deployment
- [ ] **Configure Expo EAS**
  - [ ] Install EAS CLI: `npm install -g eas-cli`
  - [ ] Run: `eas build:configure`
  - [ ] Update `app.json` with production API URL
  - [ ] Set up app icons and splash screens

- [ ] **Build for iOS**
  - [ ] `eas build --platform ios`
  - [ ] Download IPA
  - [ ] Test on TestFlight
  - [ ] Submit to App Store: `eas submit --platform ios`

- [ ] **Build for Android**
  - [ ] `eas build --platform android`
  - [ ] Download AAB
  - [ ] Test on internal track
  - [ ] Submit to Google Play: `eas submit --platform android`

### Monitoring & Observability
- [ ] **Set up Sentry**
  - [ ] Sign up at sentry.io
  - [ ] Install SDKs (already in code)
  - [ ] Configure DSN in environment variables
  - [ ] Test error reporting
  - [ ] Set up alerts (Slack/email)

- [ ] **Set up logging**
  - [ ] API logs → CloudWatch / Datadog
  - [ ] GPU worker logs → same
  - [ ] Add request ID to all logs
  - [ ] Set up log retention policy

- [ ] **Create dashboards**
  - [ ] Job success rate (target: >95%)
  - [ ] Average processing time
  - [ ] Queue depth
  - [ ] API response times
  - [ ] Error rates
  - [ ] Active subscriptions
  - [ ] Revenue (MRR)

- [ ] **Set up alerts**
  - [ ] Job failure rate > 5%
  - [ ] Queue depth > 100
  - [ ] API error rate > 1%
  - [ ] GPU worker unresponsive
  - [ ] S3 storage > 80% of budget

### CI/CD Pipeline
- [ ] **GitHub Actions** (already configured in `.github/workflows/ci.yml`)
  - [ ] Test: runs on every PR
  - [ ] Deploy API: on push to `main`
  - [ ] Deploy GPU worker: on push to `main`
  - [ ] Add deployment notifications (Slack/Discord)

---

## 🎨 Phase 4: Polish & UX

### Mobile App Improvements
- [ ] **Onboarding flow**
  - [ ] Welcome screen with app explanation
  - [ ] Permission requests (photos, notifications)
  - [ ] Quick tutorial (3 steps)
  - [ ] Skip/Done button

- [ ] **UI polish**
  - [ ] Add loading animations (Lottie or Rive)
  - [ ] Add empty states ("No images yet")
  - [ ] Add error states with retry button
  - [ ] Add haptic feedback
  - [ ] Dark mode support

- [ ] **Additional screens**
  - [ ] History/Gallery (all generated images)
  - [ ] Image detail view (share, download, delete)
  - [ ] Profile screen (edit name, email)
  - [ ] Help/FAQ screen
  - [ ] About screen (version, credits)

- [ ] **Share functionality**
  - [ ] Share generated image to social media
  - [ ] Copy image to clipboard
  - [ ] Save to device photos
  - [ ] Generate shareable link

### Backend Improvements
- [ ] **Rate limiting** (`services/api/src/index.ts`)
  - [ ] Install `@fastify/rate-limit`
  - [ ] Limit: 10 uploads per hour (free tier)
  - [ ] Limit: 100 uploads per hour (paid tier)
  - [ ] Return 429 with retry-after header

- [ ] **Image validation**
  - [ ] Check file size (max 10MB)
  - [ ] Check dimensions (min 512x512, max 4096x4096)
  - [ ] Check format (JPEG, PNG only)
  - [ ] Strip EXIF metadata
  - [ ] Generate content hash (for deduplication)

- [ ] **Analytics** (optional)
  - [ ] Track: uploads, generations, purchases
  - [ ] Use privacy-friendly solution (Plausible, self-hosted)
  - [ ] Or skip tracking to avoid ATT prompt (iOS)

### GPU Worker Improvements
- [ ] **Breed-specific LoRAs** (optional)
  - [ ] Find or train LoRAs for popular breeds
  - [ ] Add breed detection (if not user-provided)
  - [ ] Load appropriate LoRA based on breed
  - [ ] Test quality improvements

- [ ] **Quality improvements**
  - [ ] Add upscaler (Real-ESRGAN, SwinIR)
  - [ ] Add face restoration (CodeFormer) for pets
  - [ ] Add background inpainting (if segmented)
  - [ ] Test: before/after quality comparison

- [ ] **Performance optimizations**
  - [ ] Model quantization (FP16 → INT8 if acceptable)
  - [ ] Batch processing (if multiple images)
  - [ ] Warm pool (keep 1-2 GPU instances ready)
  - [ ] A/B test different model sizes vs speed

---

## 🔒 Phase 5: Security & Hardening

### Security Audit
- [ ] **Input validation**
  - [ ] All API endpoints use Zod schemas
  - [ ] File uploads validated (size, type, content)
  - [ ] SQL injection: prevented by Prisma
  - [ ] XSS: React escapes by default

- [ ] **Authentication & authorization**
  - [ ] All protected endpoints require valid JWT
  - [ ] Users can only access their own data
  - [ ] Admin endpoints (if any) are locked down
  - [ ] Test: try to access other user's jobs

- [ ] **Secrets management**
  - [ ] No secrets in code (all in env vars)
  - [ ] Rotate AWS keys quarterly
  - [ ] Rotate database password annually
  - [ ] Use separate keys for dev/staging/prod

- [ ] **HTTPS everywhere**
  - [ ] API: enforced by Fly.io
  - [ ] Mobile: uses HTTPS for all requests
  - [ ] S3: presigned URLs are HTTPS only

- [ ] **Dependency updates**
  - [ ] Enable Dependabot (GitHub)
  - [ ] Review and merge security updates weekly
  - [ ] Update major versions quarterly

### Penetration Testing
- [ ] **Run automated scans**
  - [ ] OWASP ZAP or similar
  - [ ] Check for common vulnerabilities
  - [ ] Fix any critical/high issues

- [ ] **Manual testing**
  - [ ] Test file upload abuse (malware, huge files)
  - [ ] Test authentication bypass attempts
  - [ ] Test rate limit bypass
  - [ ] Test SQL injection (should fail with Prisma)

---

## 📊 Phase 6: Business & Growth

### App Store Optimization (ASO)
- [ ] **App Store listing**
  - [ ] Catchy title: "Kittypup - AI Pet Baby Generator"
  - [ ] Subtitle/short description
  - [ ] Keywords: cat, dog, kitten, puppy, AI, photo, cute
  - [ ] Screenshots (5-8) showing before/after
  - [ ] Video preview (15-30s)

- [ ] **Google Play listing**
  - [ ] Same as above
  - [ ] Feature graphic (1024x500)
  - [ ] Promo video (YouTube link)

### Marketing Assets
- [ ] **Landing page** (optional but recommended)
  - [ ] Hero: "Turn your pet into a baby!"
  - [ ] Before/after examples
  - [ ] How it works (3 steps)
  - [ ] Pricing
  - [ ] Download buttons (App Store + Play)
  - [ ] Privacy Policy + Terms links

- [ ] **Social media**
  - [ ] Create accounts (Instagram, TikTok, Twitter)
  - [ ] Post before/after examples
  - [ ] Use hashtags: #kittypup #kittens #puppies #ai
  - [ ] Engage with pet communities

### Analytics & Metrics
- [ ] **Track key metrics**
  - [ ] DAU/MAU (daily/monthly active users)
  - [ ] Conversion rate (free → paid)
  - [ ] Churn rate (subscriptions)
  - [ ] Average revenue per user (ARPU)
  - [ ] Customer acquisition cost (CAC)
  - [ ] Lifetime value (LTV)

- [ ] **Set goals**
  - [ ] Week 1: 100 users
  - [ ] Month 1: 1,000 users, 1% paid
  - [ ] Month 3: 10,000 users, 5% paid
  - [ ] Month 6: Break even
  - [ ] Year 1: $10K MRR

### Customer Support
- [ ] **Set up support channels**
  - [ ] Support email: support@yourapp.com
  - [ ] In-app "Contact Us" button
  - [ ] FAQ page (web + in-app)

- [ ] **Create FAQ**
  - [ ] "How does it work?"
  - [ ] "Why was my photo rejected?"
  - [ ] "How do I cancel my subscription?"
  - [ ] "How do I delete my data?"
  - [ ] "Is my data safe?"

### Iteration & Feedback
- [ ] **Collect user feedback**
  - [ ] In-app feedback form
  - [ ] App Store/Play Store reviews (respond to all)
  - [ ] User surveys (email or in-app)
  - [ ] Feature request voting (Canny, UserVoice)

- [ ] **Prioritize features**
  - [ ] Video support (turn puppy video into baby)
  - [ ] More animals (bunnies, birds, etc.)
  - [ ] Age slider (baby → adult → senior)
  - [ ] Breed transformation (e.g., poodle → husky)
  - [ ] Pet accessories (hats, glasses, etc.)

---

## ✅ Pre-Launch Checklist

**Complete before submitting to app stores:**

### Technical
- [ ] All critical bugs fixed
- [ ] App tested on iOS (multiple devices)
- [ ] App tested on Android (multiple devices)
- [ ] API load tested (100+ concurrent users)
- [ ] GPU worker tested (multiple images)
- [ ] IAP tested in sandbox (iOS + Android)
- [ ] Push notifications tested
- [ ] Data deletion tested
- [ ] Data export tested

### Legal & Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] App Store privacy labels filled
- [ ] Google Play data safety filled
- [ ] Account deletion web form created
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified

### Content
- [ ] App icon designed (1024x1024)
- [ ] Screenshots captured (5-8 per platform)
- [ ] Video preview recorded (optional but recommended)
- [ ] App description written
- [ ] Keywords researched
- [ ] Support email set up

### Business
- [ ] App Store developer account ($99/year)
- [ ] Google Play developer account ($25 one-time)
- [ ] Bank account linked (for payouts)
- [ ] Tax forms submitted
- [ ] Pricing finalized
- [ ] Subscription terms finalized

---

## 🎯 Post-Launch TODO

### Week 1
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor error rates (API, GPU worker)
- [ ] Respond to app store reviews
- [ ] Fix critical bugs ASAP
- [ ] Track: installs, activations, conversions

### Month 1
- [ ] Analyze user behavior (what features are used?)
- [ ] Identify drop-off points
- [ ] A/B test pricing (if needed)
- [ ] Iterate on AI quality based on feedback
- [ ] Ship first update with improvements

### Ongoing
- [ ] Weekly: Check metrics, respond to support
- [ ] Monthly: Review financials, adjust pricing/features
- [ ] Quarterly: Security audit, dependency updates
- [ ] Annually: Review compliance, update policies

---

## 🚀 Future Features (Backlog)

- [ ] Web version (React + tRPC)
- [ ] Video support (animate baby pets)
- [ ] More animals (rabbits, birds, reptiles, etc.)
- [ ] Time travel (baby → senior)
- [ ] Breed morphing (transform one breed to another)
- [ ] Pet accessories (AR filters: hats, glasses, etc.)
- [ ] Collage maker (multiple baby pets in one image)
- [ ] Referral program (invite friends, get credits)
- [ ] Gift cards / gift subscriptions
- [ ] API for third-party integrations
- [ ] White-label solution for pet brands

---

## 📝 Notes

- **Priority**: MVP items (Phase 1-2) are critical for launch
- **Timeline**: Realistic MVP = 4-6 weeks with full-time effort
- **Budget**: Initial: ~$200/month (infra) + $99+$25 (app stores)
- **Help needed**: Consider hiring for Privacy Policy + Terms (lawyer)

**Track progress**: Check off items as you complete them! 🎉

