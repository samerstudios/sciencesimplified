-- Drop the insecure public DELETE and UPDATE policies on selected_papers table
DROP POLICY IF EXISTS "Public delete access to selected_papers" ON public.selected_papers;
DROP POLICY IF EXISTS "Public update access to selected_papers" ON public.selected_papers;

-- The public read access and service role policies remain intact for proper functionality