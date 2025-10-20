-- Increase file size limit for research-pdfs bucket to 100MB
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB in bytes
WHERE id = 'research-pdfs';