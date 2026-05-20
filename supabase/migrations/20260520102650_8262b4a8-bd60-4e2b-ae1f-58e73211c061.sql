CREATE OR REPLACE FUNCTION public.get_sales_ranking(start_date TEXT, end_date TEXT)
RETURNS TABLE (
  employee_name TEXT,
  employee_code TEXT,
  total_sales NUMERIC,
  participation_percent NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_period_sales NUMERIC;
BEGIN
  -- Calculate total sales for the period first to get percentages
  SELECT COALESCE(SUM(amount), 0) INTO total_period_sales
  FROM public.sales
  WHERE sale_date >= start_date::DATE AND sale_date <= end_date::DATE;

  RETURN QUERY
  SELECT 
    e.name as employee_name,
    e.code as employee_code,
    COALESCE(SUM(s.amount), 0) as total_sales,
    CASE 
      WHEN total_period_sales > 0 THEN (COALESCE(SUM(s.amount), 0) / total_period_sales) * 100
      ELSE 0
    END as participation_percent
  FROM public.employees e
  LEFT JOIN public.sales s ON e.id = s.employee_id 
    AND s.sale_date >= start_date::DATE 
    AND s.sale_date <= end_date::DATE
  GROUP BY e.id, e.name, e.code
  HAVING COALESCE(SUM(s.amount), 0) > 0
  ORDER BY total_sales DESC;
END;
$$;