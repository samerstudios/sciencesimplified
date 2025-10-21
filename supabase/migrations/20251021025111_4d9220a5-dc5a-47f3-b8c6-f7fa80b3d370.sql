-- Drop insecure public DELETE policy on blog_posts table
DROP POLICY IF EXISTS "Public delete access for blog posts" ON public.blog_posts;

-- Drop insecure public UPDATE policy on blog_posts table
DROP POLICY IF EXISTS "Public update access for blog post status" ON public.blog_posts;

-- Drop the draft blog posts public read policy to protect unpublished content
DROP POLICY IF EXISTS "Public read access for draft blog posts" ON public.blog_posts;

-- The public read access for published posts and service role policies remain intact