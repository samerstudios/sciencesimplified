-- Allow public read access to selected_papers so admin interface can display them
CREATE POLICY "Public read access to selected_papers"
ON selected_papers
FOR SELECT
USING (true);

-- Allow public update access to selected_papers for PDF uploads
CREATE POLICY "Public update access to selected_papers"
ON selected_papers
FOR UPDATE
USING (true)
WITH CHECK (true);