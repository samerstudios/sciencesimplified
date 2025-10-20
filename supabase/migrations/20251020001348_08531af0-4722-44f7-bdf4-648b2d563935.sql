-- Create storage policies for research-pdfs bucket
CREATE POLICY "Allow public uploads to research-pdfs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'research-pdfs');

CREATE POLICY "Allow public reads from research-pdfs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'research-pdfs');

CREATE POLICY "Allow public updates to research-pdfs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'research-pdfs')
WITH CHECK (bucket_id = 'research-pdfs');

CREATE POLICY "Allow public deletes from research-pdfs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'research-pdfs');