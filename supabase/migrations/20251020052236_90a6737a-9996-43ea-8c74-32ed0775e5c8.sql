-- Update blog posts to have correct subject_id and hero_image_url from their source papers
UPDATE blog_posts bp
SET 
  subject_id = sp.subject_id,
  hero_image_url = CASE sp.subject_id
    WHEN '3a2750e5-4de3-443e-933a-4ff3858cd822' THEN '/neuroplasticity.jpg' -- Neuroscience
    WHEN 'ba7c52fb-0124-42dc-af06-335ec1239810' THEN '/microbiome.jpg'      -- Immunology
    WHEN 'b99b45c3-782e-4d1f-b072-745c5687e59e' THEN '/genetics.jpg'        -- Cancer
    WHEN '596e6779-37d7-4843-b9ac-9f14877f5a11' THEN '/genetics.jpg'        -- Genetics
    WHEN 'd7f66f2f-88e1-4558-879e-f141ff3b54f8' THEN '/climate.jpg'         -- Climate
    WHEN 'e418764e-bc42-45d5-864a-634c71801f94' THEN '/microbiome.jpg'      -- Microbiology
    WHEN 'a2588b0c-a80e-42aa-9ffe-f06c508f3adf' THEN '/quantum.jpg'         -- Physics
    WHEN '33f41edc-13c4-4346-a10f-2aa7d541ba3a' THEN '/fusion.jpg'          -- Energy
    ELSE '/quantum.jpg'
  END
FROM paper_citations pc
JOIN selected_papers sp ON pc.selected_paper_id = sp.id
WHERE bp.id = pc.blog_post_id;