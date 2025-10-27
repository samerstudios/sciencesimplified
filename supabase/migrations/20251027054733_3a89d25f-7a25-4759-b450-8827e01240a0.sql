-- Merge duplicate blog posts with the same title
-- Find and merge the duplicate "Could a Common Vaccine Boost Cancer Treatment?" posts

DO $$
DECLARE
  duplicate_titles text[];
  title_to_merge text;
  posts_to_merge uuid[];
  primary_post uuid;
  merged_paper_ids uuid[];
  merged_subject_ids uuid[];
BEGIN
  -- Find all duplicate titles (titles that appear more than once)
  SELECT ARRAY_AGG(DISTINCT title) INTO duplicate_titles
  FROM blog_posts
  GROUP BY title
  HAVING COUNT(*) > 1;

  -- For each duplicate title, merge the posts
  FOREACH title_to_merge IN ARRAY duplicate_titles
  LOOP
    -- Get all post IDs with this title
    SELECT ARRAY_AGG(id) INTO posts_to_merge
    FROM blog_posts
    WHERE title = title_to_merge;

    -- Use the first post as the primary (keep it, merge others into it)
    primary_post := posts_to_merge[1];

    -- Collect all unique paper_ids from all posts with this title
    SELECT ARRAY_AGG(DISTINCT unnest) INTO merged_paper_ids
    FROM (
      SELECT unnest(paper_ids)
      FROM blog_posts
      WHERE title = title_to_merge
    ) sub;

    -- Collect all unique subject_ids from all posts with this title
    SELECT ARRAY_AGG(DISTINCT unnest) INTO merged_subject_ids
    FROM (
      SELECT unnest(subject_ids)
      FROM blog_posts
      WHERE title = title_to_merge
    ) sub;

    -- Update the primary post with merged arrays
    UPDATE blog_posts
    SET 
      paper_ids = merged_paper_ids,
      subject_ids = merged_subject_ids,
      updated_at = NOW()
    WHERE id = primary_post;

    -- Delete duplicate posts (all except the primary)
    DELETE FROM blog_posts
    WHERE title = title_to_merge
      AND id != primary_post;

    RAISE NOTICE 'Merged % posts for title: %', array_length(posts_to_merge, 1), title_to_merge;
  END LOOP;
END $$;