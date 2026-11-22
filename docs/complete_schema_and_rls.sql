-- ========================================================
-- RUN THIS IN SUPABASE SQL EDITOR -> CLICK RUN
-- ========================================================

GRANT ALL ON TABLE public.stores TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.generations TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.events TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role, postgres, anon, authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role, postgres, anon, authenticated;
