-- Update hero images for Immunology and Cancer blog posts
UPDATE blog_posts 
SET hero_image_url = '/immunology.jpg' 
WHERE subject_id = 'ba7c52fb-0124-42dc-af06-335ec1239810';

UPDATE blog_posts 
SET hero_image_url = '/cancer.jpg' 
WHERE subject_id = 'b99b45c3-782e-4d1f-b072-745c5687e59e';