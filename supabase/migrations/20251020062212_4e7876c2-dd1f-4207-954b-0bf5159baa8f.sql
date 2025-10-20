-- Update hero image for Cancer blog posts with the new image
UPDATE blog_posts 
SET hero_image_url = '/cancer.jpg' 
WHERE subject_id = 'b99b45c3-782e-4d1f-b072-745c5687e59e';