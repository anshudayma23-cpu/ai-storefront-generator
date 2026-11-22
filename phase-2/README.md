# Phase 1: Foundation - AI Storefront Generator

This folder contains the isolated Phase 1 implementation for the AI Storefront Generator project.

## Deliverables in Phase 1
- **Next.js 14 App Router** framework configured with TypeScript.
- **Tailwind CSS & shadcn/ui primitives** with Inter and Noto Sans Devanagari fonts configured for Indian typography (English, Hindi, Hinglish).
- **Supabase Database Schema & Client** (`lib/db/schema.sql`, `lib/db/client.ts`).
- **Domain Types & Zod Schemas** (`lib/types.ts`, `lib/ai/schema.ts`).
- **Cryptographic Security Utils** (`lib/utils/token.ts` with SHA-256 token hashing, `lib/utils/slug.ts` with nanoid).
- **Health Check Route** (`app/api/health/route.ts`).
- **Environment Configuration** (`.env.local`, `.env.example`).
- **Verification Script** (`scripts/test-phase1.ts`).

## How to Run Phase 1

1. **Run Acceptance Verification:**
   ```bash
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:phase1
   ```

2. **Run Development Server:**
   ```bash
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
   ```
   Open `http://localhost:3000` to view the live phase 1 verification screen.

3. **Supabase Schema Setup:**
   Run the SQL statements in `lib/db/schema.sql` in your Supabase project's SQL Editor to instantiate the `stores`, `generations`, `events`, and `rate_limits` tables.
