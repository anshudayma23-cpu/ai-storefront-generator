# Phase 3: Create & Edit UI - AI Storefront Generator

This folder contains the complete Phase 3 implementation featuring mobile-first creator onboarding, AI generation workflow, and interactive live preview editing.

## Key Deliverables in Phase 3
1. **Screen 1: Creator Input Screen (`app/page.tsx`, `components/input-form.tsx`)**
   - Free-text self-description (10–600 chars) with real-time character counter.
   - Optional Instagram handle with normalization (`@username`, `username`, or URL).
   - 1-Tap Example Chips (Fitness Coach, Tax CA, Desi Chef, Product Designer).
   - Language & tone selection chips (English, Hinglish, Hindi) with automatic script detection.
   - Clarifying question support for ambiguous requests.

2. **Screen 2: Generation Progress Screen (`components/generating-screen.tsx`)**
   - Friendly full-screen state with rotating progress status updates every 2.8s.
   - Non-blocking delay notice if generation exceeds 15s.
   - Animated storefront skeleton cards behind the overlay.

3. **Screen 3: Live Preview & Inline Editor (`app/edit/[slug]/page.tsx`)**
   - **In-place Tap-to-Edit:** Click to edit creator name, headline, bio, product titles, formats, prices, descriptions, outcome bullets, and CTA labels.
   - **Debounced Autosave (1.5s):** Automatically persists changes to Supabase (`hooks/use-autosave.ts`).
   - **Per-Section Regeneration:** Granular 🔄 regenerate button on Bio and Product cards with optional instructions modal.
   - **Undo Engine:** 1-level deep snapshot undo buffer so regenerations are never destructive.
   - **Product CRUD:** Add new offers (up to 4) or delete products (minimum 1).
   - **Pricing Rationale:** Collapsible "Why ₹X?" explanations on each product card.

4. **API Handlers:**
   - `POST /api/generate`: Validates input, reads Instagram signals, triggers AI, and creates draft store.
   - `POST /api/regenerate`: Handles single-section regeneration with instructions.
   - `GET /api/store/[slug]` & `PATCH /api/store/[slug]`: Authenticated draft retrieval and debounced autosaving.

5. **Instagram Signal Reader (`lib/instagram/reader.ts`):**
   - Best-effort public metadata reader with a 4-second timeout that never throws.

## Running Phase 3
```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```
Open `http://localhost:3000` to test the complete creation, generation, and editing workflow!
