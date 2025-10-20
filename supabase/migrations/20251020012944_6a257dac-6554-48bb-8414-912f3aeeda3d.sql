
-- Delete all PDFs from storage
DELETE FROM storage.objects WHERE bucket_id = 'research-pdfs';

-- Delete all paper citations
DELETE FROM paper_citations;

-- Delete all selected papers
DELETE FROM selected_papers;

-- Delete all blog posts
DELETE FROM blog_posts;
