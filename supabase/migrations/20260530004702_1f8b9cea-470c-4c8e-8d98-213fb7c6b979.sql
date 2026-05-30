-- Set secure search_path for the function to prevent search_path hijacking
ALTER FUNCTION public.get_champion_ranking(INTEGER) SET search_path = public;

-- Revoke public access for better security (only allow authenticated and service_role)
REVOKE EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) TO service_role;
