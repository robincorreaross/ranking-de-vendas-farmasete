-- Create a function to calculate wins efficiently in the database
CREATE OR REPLACE FUNCTION public.get_champion_ranking(lookback_years INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    name TEXT,
    wins BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_sales AS (
        -- Group sales by day and employee
        SELECT 
            s.employee_id, 
            s.sale_date, 
            SUM(s.amount) as total_amount
        FROM public.sales s
        WHERE s.sale_date >= (CURRENT_DATE - (lookback_years || ' years')::INTERVAL)
        GROUP BY s.employee_id, s.sale_date
    ),
    daily_winners AS (
        -- Find the winner for each day
        SELECT 
            ds.employee_id,
            ds.sale_date,
            RANK() OVER (PARTITION BY ds.sale_date ORDER BY ds.total_amount DESC) as rank
        FROM daily_sales ds
    )
    -- Aggregate wins by employee and join with employee names
    SELECT 
        e.id, 
        e.name, 
        COUNT(dw.sale_date)::BIGINT as wins
    FROM public.employees e
    JOIN daily_winners dw ON e.id = dw.employee_id
    WHERE dw.rank = 1
    GROUP BY e.id, e.name
    HAVING COUNT(dw.sale_date) > 0
    ORDER BY wins DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_champion_ranking(INTEGER) TO service_role;
