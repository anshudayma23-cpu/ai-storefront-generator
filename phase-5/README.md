# Phase 5: Reliability & Hardening - AI Storefront Generator

This folder contains the complete Phase 5 implementation featuring rate limiting, 24-hour response caching, error translation, quota defense, and security hardening.

## Key Deliverables in Phase 5:

1. **Per-IP Rate Limiting (`lib/db/rate-limiter.ts`)**
   - Supabase-backed rate limiter enforcing a strict **10 generations per hour per IP cap**.
   - No external Redis or paid Upstash dependency.
   - When triggered, returns HTTP 429 with empathetic creator guidance and minute countdowns.

2. **24-Hour Input Hash Response Caching (`lib/ai/generate.ts`)**
   - Automatically computes `SHA-256(description + language)`.
   - On matching recent inputs, serves previous validated outputs from Supabase in <300ms, preserving free Gemini quota.

3. **Friendly Error Mapping Layer (`lib/utils/errors.ts`)**
   - Maps raw exceptions and internal statuses (`RATE_LIMITED`, `LLM_TIMEOUT`, `LLM_QUOTA_EXCEEDED`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `STORE_NOT_FOUND`) to empathetic, human-readable instructions.
   - Zero raw stack traces or JSON exceptions exposed to the creator.

4. **HTTP Security Headers (`next.config.js`)**
   - Strict `X-Content-Type-Options: nosniff`
   - Strict `X-Frame-Options: DENY`
   - Strict `Referrer-Policy: strict-origin-when-cross-origin`

5. **Quota Error & 503/429 Defense**
   - Automatic retry and seamless fallback to curated niche starters with prominent notifications.

## Testing Phase 5:
```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```
Open `http://localhost:3000` to test hardened generation with cached re-runs and rate-limit safety checks.
