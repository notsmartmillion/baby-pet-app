# Compliance Guide 📋

This app handles user-uploaded photos and must comply with:
- GDPR (EU)
- CCPA/CPRA (California)
- Apple App Store requirements
- Google Play Store requirements

## Overview

✅ **Implemented in skeleton:**
- Data deletion endpoints (GDPR Art. 17, CCPA)
- Data export endpoints (GDPR Art. 15, CCPA)
- People-detection guardrail (stub)
- Auto-deletion of originals (72h)
- Privacy-focused architecture

⚠️ **Still needed:**
- Privacy Policy (public URL)
- Terms of Service
- App Store privacy labels
- Google Play data safety form
- Account deletion web page

---

## GDPR Compliance

### Art. 15 - Right of Access (Data Export)

**Implementation**: `services/api/src/services/complianceService.ts`

```typescript
trpc.requestExport.mutate({ userId, email })
```

**What to provide:**
- User profile data
- All uploaded images (if not auto-deleted)
- All generated results
- Purchase history
- Entitlement/subscription status

**Timeline**: Must respond within 30 days

**In-app**: Settings → "Download My Data"

### Art. 17 - Right to Erasure ("Right to be Forgotten")

**Implementation**: `services/api/src/services/complianceService.ts`

```typescript
trpc.requestDeletion.mutate({ userId, reason })
```

**What to delete:**
- User account
- All images (S3)
- All jobs and metadata (database)
- Purchase records (or anonymize)

**Timeline**: Without undue delay (typically 30 days max)

**In-app**: Settings → "Delete All My Data"

**Web**: Must also provide a web form (Google Play requirement)

### Legal Basis for Processing

In your Privacy Policy, state your legal basis:
- **Contract**: Processing pet photos to deliver the service (Art. 6(1)(b))
- **Consent**: Marketing emails, analytics (Art. 6(1)(a))
- **Legitimate Interest**: Fraud prevention (Art. 6(1)(f))

### Data Retention

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Original photos | 72 hours | Service delivery, then auto-delete |
| Generated results | Indefinite | User owns them |
| User account | Until deletion request | Contract |
| Job metadata | 90 days | Analytics, support |
| Purchase records | 7 years | Tax/accounting |

---

## CCPA/CPRA (California Privacy Rights Act)

### Right to Know

Same as GDPR Art. 15 (data export).

### Right to Delete

Same as GDPR Art. 17.

### Right to Opt-Out of Sale

If you don't sell user data (you shouldn't!), state this in Privacy Policy:
> "We do not sell your personal information."

### Disclosure Requirements

In your Privacy Policy, disclose:
1. Categories of personal information collected
2. Purposes for collection
3. Categories of third parties you share with
4. How to exercise rights

### "Do Not Sell My Personal Information" Link

If you have a website, add this link in the footer (even if you don't sell data).

---

## Apple App Store Requirements

### Privacy Nutrition Labels

In App Store Connect → App Privacy, declare:

**Data Collected:**
- Photos (to generate baby pet images)
- Purchase History (for entitlements)
- Device ID (for authentication, crash reports)
- Usage Data (analytics - optional)

**Purposes:**
- App Functionality (pet photo processing)
- Product Personalization (optional)
- Analytics (optional)

**Tracking:**
- If you use IDFA or cross-app tracking → ATT prompt required
- If no tracking → select "No, we do not track"

**Third Parties with Access:**
- Cloud storage provider (AWS S3)
- Payment processor (Apple)
- Analytics (if used)

### App Tracking Transparency (ATT)

If you track users across apps (e.g., for ads), show ATT prompt:

```swift
import AppTrackingTransparency

ATTrackingManager.requestTrackingAuthorization { status in
  // Handle response
}
```

If you **don't track** (recommended), you can skip ATT.

### Sign in with Apple

If you offer other social logins (Google, Facebook), you **must** also offer Sign in with Apple.

### Subscription Management

Users must be able to:
1. See subscription status
2. Cancel/modify subscription
3. Access via in-app link to App Store subscriptions

Add in Settings:
```swift
if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
  UIApplication.shared.open(url)
}
```

---

## Google Play Requirements

### Data Safety Form

In Play Console → Data Safety, declare:

**Data Types:**
- Photos and videos → YES
- Personal info (email) → YES if you collect
- Financial info → NO (handled by Google Play)
- Device or other IDs → YES (for auth)

**Data Usage:**
- App functionality
- Account management

**Data Sharing:**
- Shared with service providers (AWS, etc.)

**Data Security:**
- Encrypted in transit (HTTPS)
- Encrypted at rest (S3)
- User can request deletion

### Account Deletion

Google Play **requires**:
1. In-app deletion button ✅ (implemented)
2. Web-based deletion form ⚠️ (create a simple HTML page)

**Web form** (minimal example):
```html
<!-- Host at https://yourapp.com/delete-account -->
<form action="/api/delete-account" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Request Account Deletion</button>
</form>
```

Link this in Play Console → Data Safety → "Web link for users to request account deletion"

### Family Policy

If your app is for kids (under 13), additional rules apply:
- Coppa compliance
- No third-party ads
- No in-app purchases without parental consent

**This app should NOT target kids.** State age requirement: 18+ (or 13+ with parental consent).

---

## Privacy Policy (Required)

Must include:
1. **What data you collect**: Photos, email, device ID
2. **Why you collect it**: To generate baby pet images
3. **How you use it**: Processing on servers, then auto-delete originals
4. **Third parties**: AWS (storage), Apple/Google (payments)
5. **Retention**: 72h for originals, indefinite for results
6. **User rights**: Delete, export, opt-out
7. **Contact**: Email for data requests
8. **Updates**: How you'll notify of policy changes

### Where to host
- Public URL (e.g., `https://yourapp.com/privacy`)
- Link in both app stores
- Link in app (Settings screen)

### Template
Use a generator (iubenda, Termly) or hire a lawyer.

---

## Terms of Service (Required)

Must include:
1. **Acceptable use**: Only pet photos, no people
2. **License**: You grant us right to process photos
3. **Ownership**: User owns generated images
4. **Liability**: Limit damages, no guarantees
5. **Termination**: We can suspend accounts
6. **Dispute resolution**: Arbitration/jurisdiction
7. **Subscriptions**: Billing, renewal, refunds

---

## Compliance Checklist

### Before Launch

- [ ] Write Privacy Policy (public URL)
- [ ] Write Terms of Service (public URL)
- [ ] Create account deletion web form (Google Play requirement)
- [ ] Fill out App Store Privacy labels
- [ ] Fill out Google Play Data Safety form
- [ ] Test data deletion flow
- [ ] Test data export flow
- [ ] Set up auto-deletion cron job (72h)
- [ ] Add in-app links to Privacy/ToS/Subscription management
- [ ] Decide: track users? If yes, implement ATT prompt (iOS)
- [ ] Decide: offer social login? If yes, add Sign in with Apple
- [ ] Document data breach response plan
- [ ] If EU users: ensure GDPR-compliant data processors (SCCs with AWS)

### After Launch

- [ ] Monitor data deletion requests (respond within 30 days)
- [ ] Monitor data export requests (respond within 30 days)
- [ ] Log all data subject requests (audit trail)
- [ ] Review third-party SDK privacy policies annually
- [ ] Update Privacy Policy if you add new features/data collection

---

## People-Detection Guardrail

**Why?**
- Avoid processing human likeness (ethical/legal risk)
- Reduce biometric data concerns (GDPR/BIPA)
- Simplify privacy disclosures

**Implementation** (stub in `services/worker-gpu/pipeline.py`):

```python
def detect_people(image_path: str) -> bool:
    # Option 1: MediaPipe Face Detection
    # Option 2: YOLOv8 person detection
    # Option 3: AWS Rekognition / Google Vision API
    
    # Return True if people detected
    return has_faces or has_people
```

**User experience:**
```
❌ "We detected people in this photo. Please upload only pet photos."
```

---

## Data Breach Plan

If user data is compromised:

1. **Contain**: Shut down compromised service
2. **Assess**: What data was exposed?
3. **Notify**:
   - GDPR: Within 72h to supervisory authority
   - CCPA: Without unreasonable delay
   - Users: If high risk to their rights
4. **Document**: Keep records of breach, response, timeline

---

## International Data Transfers (EU → US)

If you process EU user data in the US (e.g., AWS us-east-1):

- Use **Standard Contractual Clauses (SCCs)** with AWS
- Mention in Privacy Policy: "We transfer data to the US under SCCs"
- Consider using **EU regions** (AWS eu-west-1) for EU users

---

## Summary

| Requirement | Status | Action |
|-------------|--------|--------|
| Data deletion API | ✅ Done | Test thoroughly |
| Data export API | ✅ Done | Test thoroughly |
| Auto-delete originals | ✅ Done | Set up cron job |
| People guardrail | ⚠️ Stub | Implement real detection |
| Privacy Policy | ❌ TODO | Write + host publicly |
| Terms of Service | ❌ TODO | Write + host publicly |
| App Store labels | ❌ TODO | Fill out in App Store Connect |
| Play Data Safety | ❌ TODO | Fill out in Play Console |
| Deletion web form | ❌ TODO | Create HTML page |
| Breach plan | ❌ TODO | Document procedure |

---

**💡 Pro tip**: Consult a privacy lawyer before launch, especially if targeting EU/CA users!

