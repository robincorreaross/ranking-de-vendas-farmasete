-- Create sales table
CREATE TABLE public.sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policies for sales
CREATE POLICY "Users can view their own sales" 
ON public.sales FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" 
ON public.sales FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" 
ON public.sales FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" 
ON public.sales FOR DELETE 
USING (auth.uid() = user_id);

-- Migration of existing sales_value from employees to sales table (optional but good for consistency)
INSERT INTO public.sales (employee_id, amount, sale_date, user_id)
SELECT id, sales_value, CURRENT_DATE, user_id FROM public.employees WHERE sales_value > 0;

-- Optional: Remove sales_value from employees later if we want to rely only on sales table
-- For now, let's keep it to avoid breaking changes during transition or use it as a cache.
