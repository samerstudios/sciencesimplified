-- Allow public read access to draft blog posts as well
-- This is needed for the admin interface to display drafts
DROP POLICY IF EXISTS "Public read access for published blog posts" ON blog_posts;

CREATE POLICY "Public read access for all blog posts"
  ON blog_posts
  FOR SELECT
  USING (true);
