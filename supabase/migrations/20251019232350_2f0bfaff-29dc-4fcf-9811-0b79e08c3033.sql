-- Create junction table for many-to-many relationship between journals and subjects
CREATE TABLE public.journal_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id uuid NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(journal_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.journal_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for journal_subjects"
ON public.journal_subjects
FOR SELECT
USING (true);

CREATE POLICY "Service role full access to journal_subjects"
ON public.journal_subjects
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Migrate existing data from journals.subject_id to journal_subjects
INSERT INTO public.journal_subjects (journal_id, subject_id)
SELECT id, subject_id
FROM public.journals
WHERE subject_id IS NOT NULL;

-- Remove the old subject_id column from journals (no longer needed)
ALTER TABLE public.journals DROP COLUMN subject_id;