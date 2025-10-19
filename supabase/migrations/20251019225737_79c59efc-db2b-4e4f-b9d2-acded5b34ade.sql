-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create journals table with impact factors
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issn TEXT,
  impact_factor DECIMAL(6,3),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  is_interdisciplinary BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, subject_id)
);

-- Create selected_papers table (papers awaiting PDF upload)
CREATE TABLE public.selected_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  journal_name TEXT NOT NULL,
  article_title TEXT NOT NULL,
  authors TEXT NOT NULL,
  doi TEXT NOT NULL,
  abstract TEXT NOT NULL,
  pubmed_id TEXT,
  publication_date DATE,
  selection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending_pdf' CHECK (status IN ('pending_pdf', 'pdf_uploaded', 'processed', 'rejected')),
  quality_score DECIMAL(3,2),
  pdf_storage_path TEXT,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  hero_image_url TEXT,
  read_time INTEGER NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected')),
  quality_flags JSONB DEFAULT '[]'::jsonb,
  paper_ids UUID[] NOT NULL,
  author TEXT DEFAULT 'AI Science Communicator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create paper_citations junction table (many-to-many relationship)
CREATE TABLE public.paper_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  selected_paper_id UUID REFERENCES public.selected_papers(id) ON DELETE CASCADE,
  citation_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blog_post_id, selected_paper_id)
);

-- Enable RLS on all tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_citations ENABLE ROW LEVEL SECURITY;

-- Public read access for subjects, journals, and published blog posts
CREATE POLICY "Public read access for subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Public read access for journals"
  ON public.journals FOR SELECT
  USING (true);

CREATE POLICY "Public read access for published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

-- Admin-only write access (will set up admin roles later)
CREATE POLICY "Service role full access to subjects"
  ON public.subjects FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to journals"
  ON public.journals FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to selected_papers"
  ON public.selected_papers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to blog_posts"
  ON public.blog_posts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to paper_citations"
  ON public.paper_citations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Insert initial subjects
INSERT INTO public.subjects (name, description) VALUES
  ('Neuroscience', 'Brain, nervous system, and cognitive science'),
  ('Immunology', 'Immune system and disease defense'),
  ('Cancer', 'Cancer biology and treatment'),
  ('Genetics', 'DNA, heredity, and genetic engineering'),
  ('Climate', 'Climate science and environmental change'),
  ('Microbiology', 'Microorganisms and microbial systems'),
  ('Physics', 'Quantum mechanics, fusion, and fundamental physics'),
  ('Energy', 'Energy systems and sustainable technology');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for PDFs (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-pdfs',
  'research-pdfs',
  false,
  52428800,
  ARRAY['application/pdf']
);

-- Storage policies (service role only)
CREATE POLICY "Service role can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'research-pdfs' AND auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can read PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'research-pdfs' AND auth.jwt()->>'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_journals_subject ON public.journals(subject_id);
CREATE INDEX idx_journals_impact_factor ON public.journals(impact_factor DESC);
CREATE INDEX idx_selected_papers_status ON public.selected_papers(status);
CREATE INDEX idx_selected_papers_week ON public.selected_papers(week_number, year);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_publish_date ON public.blog_posts(publish_date DESC);