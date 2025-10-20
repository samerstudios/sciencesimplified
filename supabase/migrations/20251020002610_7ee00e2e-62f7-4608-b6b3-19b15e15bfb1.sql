-- Allow public read access to draft blog posts (for admin page)
CREATE POLICY "Public read access for draft blog posts" 
ON blog_posts 
FOR SELECT 
USING (status = 'draft');

-- Allow public update access for publishing blog posts (for admin page)
CREATE POLICY "Public update access for blog post status" 
ON blog_posts 
FOR UPDATE 
USING (true)
WITH CHECK (true);