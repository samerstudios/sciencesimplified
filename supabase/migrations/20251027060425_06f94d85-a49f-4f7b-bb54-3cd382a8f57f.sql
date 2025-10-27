-- Allow public delete access for blog_posts for admin functionality
CREATE POLICY "Public delete access for blog_posts"
ON public.blog_posts
FOR DELETE
USING (true);