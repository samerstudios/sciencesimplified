-- Add DELETE policy for blog posts
CREATE POLICY "Public delete access for blog posts"
ON public.blog_posts
FOR DELETE
USING (true);