-- Add public delete access policy for selected_papers
CREATE POLICY "Public delete access to selected_papers" 
ON selected_papers 
FOR DELETE 
USING (true);