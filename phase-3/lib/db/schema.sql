-- ==============================================================================
-- Schema: AI Storefront Generator (Supabase Postgres)
-- ==============================================================================

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    edit_token_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Creator Store',
    handle TEXT,
    contact_url TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    theme TEXT NOT NULL DEFAULT 'clean',
    niche TEXT,
    bio JSONB NOT NULL DEFAULT '{}'::jsonb,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    input_text TEXT,
    profile_signals JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores (slug);
CREATE INDEX IF NOT EXISTS idx_stores_edit_token_hash ON public.stores (edit_token_hash);

-- 2. GENERATIONS TABLE (observability & evaluation)
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores (id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('full', 'bio', 'product')),
    model TEXT NOT NULL,
    latency_ms INTEGER,
    raw_output JSONB,
    valid BOOLEAN NOT NULL DEFAULT false,
    fallback_used BOOLEAN NOT NULL DEFAULT false,
    input_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_generations_input_hash ON public.generations (input_hash);
CREATE INDEX IF NOT EXISTS idx_generations_store_id ON public.generations (store_id);

-- 3. EVENTS TABLE (lightweight analytics)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores (id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('view', 'cta_click', 'share')),
    product_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_store_id ON public.events (store_id);

-- 4. RATE_LIMITS TABLE (Supabase IP-based throttling)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits (window_start);
