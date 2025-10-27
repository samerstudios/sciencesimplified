-- Add subject_ids array column to blog_posts (keeping subject_id for backwards compatibility initially)
ALTER TABLE blog_posts ADD COLUMN subject_ids uuid[] DEFAULT '{}';

-- Populate subject_ids with the existing subject_id
UPDATE blog_posts SET subject_ids = ARRAY[subject_id] WHERE subject_id IS NOT NULL;

-- Create an index for faster queries on subject_ids
CREATE INDEX idx_blog_posts_subject_ids ON blog_posts USING GIN(subject_ids);