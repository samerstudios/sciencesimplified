-- Delete duplicate papers, keeping only the oldest one for each (subject_id, week_number, year, pubmed_id) combination
DELETE FROM selected_papers
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY subject_id, week_number, year, pubmed_id ORDER BY created_at ASC) AS rn
    FROM selected_papers
  ) t
  WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE selected_papers 
ADD CONSTRAINT unique_paper_per_subject_week 
UNIQUE (subject_id, week_number, year, pubmed_id);