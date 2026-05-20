-- Set search path to public for security
ALTER FUNCTION public.get_sales_ranking(TEXT, TEXT) SET search_path = public;

-- Revoke default execute permissions
REVOKE EXECUTE ON FUNCTION public.get_sales_ranking(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_sales_ranking(TEXT, TEXT) FROM anon;

-- Grant execute to authenticated users (this includes your n8n if using a service role or user token)
GRANT EXECUTE ON FUNCTION public.get_sales_ranking(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_ranking(TEXT, TEXT) TO service_role;