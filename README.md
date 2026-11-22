# 🚀 AI Storefront Generator

> **Built for SuperProfile (Cosmofeed Technologies) Take-Home Assignment**  
> **Role:** Product Manager (AI-Native, 0 to 1)  
> **Developer & PM:** Anshu  
> **Core Constraint:** 100% Free Tools / Zero Spend ($0)

An AI-native link-in-bio storefront generator designed specifically for Indian micro-creators. In under 60 seconds, a creator turns a short self-description (and optional Instagram handle) into a complete, high-converting digital storefront with an AI-crafted bio, 2–4 calibrated digital offerings in INR (ebooks, templates, recorded courses, 1:1 sessions), inline editing, and a public shareable URL.

---

## 🌐 Live Demo & Deployment

- **Production URL:** Deployable directly to Vercel Hobby tier with zero configuration.
- **Local Dev:** `http://localhost:3000`

---

## 🛠️ Deploying to Vercel (Step-by-Step)

This repository is pre-configured for **one-click Vercel deployment** with the Next.js App Router at root and automatic keep-alive cron jobs.

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: complete AI storefront generator"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2. Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
2. Select your imported GitHub repository.
3. Keep the **Framework Preset** as `Next.js` and **Root Directory** as `./`.

### 3. Configure Environment Variables in Vercel
Under **Project Settings** -> **Environment Variables**, add the following 5 variables:

| Variable Name | Value Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio free tier key | `AIzaSy...` |
| `GEMINI_MODEL` | Flash-class Gemini model | `gemini-3.5-flash-lite` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role secret key | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Your live Vercel production URL | `https://<your-project>.vercel.app` |

4. Click **Deploy**. Vercel will build and deploy the application in under 60 seconds!

---

## 💰 Zero-Spend / Free-Tier Proof

Every component runs strictly within generous free tiers without requiring billing or a credit card on file:

| Capability | Free Choice | Free-Tier Guarantees & Constraints |
|---|---|---|
| **LLM Inference** | Google Gemini API (`gemini-3.5-flash-lite`) | Free tier via Google AI Studio (15 RPM / 1M TPM / 1,500 RPD). Free tier quota respected via server-side rate limits & 24h SHA-256 cache. |
| **Hosting & CDN** | Vercel Hobby Tier | Unlimited bandwidth for personal projects, automated HTTPS, edge headers. |
| **Database** | Supabase Postgres (Free Tier) | 500MB database, Row Level Security, instant PostgREST endpoints. |
| **Keep-Alive Cron** | Vercel Cron (`vercel.json`) & GitHub Actions | Daily ping to `/api/health` ensures Supabase free-tier never pauses after 7 days of inactivity. |
| **Rate Limiter** | Supabase Table (`rate_limits`) | IP-based sliding window rate limiter (10 gen/hr) implemented natively in Postgres without paid Redis/Upstash. |
| **Typography** | Google Fonts (`Inter`, `Noto Sans Devanagari`) | Free open-source fonts loaded via CDN link tag. |
| **Icons & UI** | Tailwind CSS + Lucide Icons + Radix UI | Open source, zero licensing cost. |

---

## 🏗️ Architecture & Technical Highlights

```
Creator Input (Text / @handle / Tone)
        │
        ▼
POST /api/generate
  ├── 1. IP Rate Limiter (Supabase rate_limits: max 10/hr)
  ├── 2. Input Sanitization & 600-char clamp
  ├── 3. SHA-256 Hash Cache Check (24-hour cache in generations table)
  ├── 4. Optional Instagram Metadata Reader (Best-effort 4s timeout)
  ├── 5. Google Gemini AI Engine (gemini-3.5-flash-lite)
  │      └── Strict Zod Schema Enforcement + Deterministic Business Rules
  ├── 6. Secure Slug & Edit Token Generation (nanoid + SHA-256 hashed at rest)
  └── 7. Store Persistence in Supabase (stores table)
        │
        ├──► Editor: /edit/[slug]?t=[token] (Autosave, Section Regenerate, Undo, Themes)
        └──► Public: /s/[slug] (Server-Rendered, OpenGraph cards, WhatsApp deep link)
```

### Key Technical Guardrails:
1. **Deterministic Business Rules:** Clamps all prices into psychological INR price tiers (₹99, ₹199, ₹299, ₹499, ₹999, ₹1499), eliminates duplicate product formats, and strips sensational claims.
2. **Graceful Error Recovery:** No raw errors or stack traces are ever exposed to creators. If the LLM times out or rate limits trigger, a deterministic "Starter Template" is offered so creators are never left with a broken screen.
3. **Multi-Language Support:** First-class support for English, natural Hinglish (conversational Roman-script Hindi-English mix), and शुद्ध हिंदी (Devanagari script).

---

## 🧪 Verification & Test Suite

The project includes an end-to-end automated verification suite covering all 11 core functional requirements:

```bash
# Run full system E2E test suite
npm run test:e2e
```

**Test Matrix Results (11/11 Passed):**
- [x] `GET /api/health` — Database liveness & keep-alive ping
- [x] `GET /` — Mobile-first input view SSR/HTML rendering
- [x] `POST /api/generate` — Real Gemini AI generation with Hinglish & Indian pricing
- [x] `GET /api/store/[slug]` — Editor draft access with edit token
- [x] `GET /api/store/[slug]` — Security: Rejects unauthorized access without token
- [x] `PATCH /api/store/[slug]` — Debounced autosave & visual theme persistence
- [x] `POST /api/regenerate` — Granular bio and product regeneration
- [x] `POST /api/store/[slug]/publish` — One-tap publication to `/s/[slug]`
- [x] `GET /s/[slug]` — Public live SSR storefront with OpenGraph metadata
- [x] `POST /api/events` — Lightweight analytics tracking (views, clicks, shares)
- [x] `GET /s/non-existent-slug` — Friendly 404 page without stack trace leaks

---

## 📁 Repository Structure

```
├── app/                  # Next.js 14 App Router (Root, /edit, /s, /api)
│   ├── api/              # API routes (/generate, /regenerate, /store, /events, /health)
│   ├── edit/[slug]/      # Interactive storefront editor
│   ├── s/[slug]/         # High-speed public link-in-bio storefront
│   ├── layout.tsx        # Root HTML layout with CDN typography
│   └── page.tsx          # Mobile-first input landing page
├── components/           # Reusable UI & storefront components
│   ├── preview/          # Live bio, product cards, price rationale widgets
│   ├── input-form.tsx    # Tap-to-fill chips, character counter, handle input
│   └── share-drawer.tsx  # WhatsApp, copy link, native web share
├── lib/                  # Core business logic & AI pipeline
│   ├── ai/               # Gemini client, prompts, business rules, fallback
│   ├── db/               # Supabase admin client, schema, rate limiter
│   └── themes.ts         # 3 visual themes (Warm Editorial, Clean Minimal, Bold Creator)
├── docs/                 # Assignment PRD, Architecture, and Evaluation Plans
├── vercel.json           # Vercel configuration & keep-alive cron definition
└── package.json          # Root dependencies & build scripts
```

---

## ⚖️ License
Built for the SuperProfile take-home evaluation. Open source under the MIT License.
