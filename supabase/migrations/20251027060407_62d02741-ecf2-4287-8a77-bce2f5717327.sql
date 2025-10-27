-- Allow public updates to blog_posts for admin functionality
CREATE POLICY "Public update access for blog_posts"
ON public.blog_posts
FOR UPDATE
USING (true)
WITH CHECK (true);