-- GRANT PERMISSIONS FOR SUPABASE SERVICE_ROLE & ANON
GRANT ALL ON TABLE public.stores TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.generations TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.events TO service_role, postgres, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role, postgres, anon, authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres, anon, authenticated;
