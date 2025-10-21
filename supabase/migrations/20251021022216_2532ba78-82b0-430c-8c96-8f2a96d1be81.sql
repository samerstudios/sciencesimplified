
-- Update all published blog posts to use their paper's selection_date as publish_date
UPDATE blog_posts
SET publish_date = sp.selection_date
FROM paper_citations pc
JOIN selected_papers sp ON pc.selected_paper_id = sp.id
WHERE blog_posts.id = pc.blog_post_id
  AND blog_posts.status = 'published'
  AND sp.selection_date IS NOT NULL;
