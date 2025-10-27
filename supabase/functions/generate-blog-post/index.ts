import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateContent(paper: any): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  const paperContext = `Paper: "${paper.article_title}"\nAuthors: ${paper.authors}\nJournal: ${paper.journal_name}\nDOI: ${paper.doi}\nAbstract: ${paper.abstract}\n`;

  const prompt = `You are a science communicator writing for high school students and general readers with NO science background. Produce an ENGAGING, STORY-DRIVEN science blog post strictly based on the provided Paper.

AUDIENCE & STYLE RULES
- Reading level: high school (ages 14-18)
- Use ZERO jargon without an immediate plain-English explanation
- Prefer everyday language and relatable analogies (integrate them naturally into the text - NEVER use labels like "Analogy:" or "Think about this:")
- Short paragraphs (2-4 sentences), active voice, conversational tone
- First person is allowed where it improves relatability
- Length target: 600-1,000 words (approximately 5-10 minute read)

SOURCE-OF-TRUTH
- Use ONLY information contained in the papers below
- Do NOT invent facts or numbers
- If a needed detail is missing, say so briefly and move on
- DO NOT include inline citations (like "Lan et al., 2024") in the text—all citations go at the end

OUTPUT FORMAT
- Deliver valid HTML only (no Markdown)
- Use <h2> for main section headings that YOU CREATE (do NOT use the internal structure labels below)
- Use <h3> for subsections when needed
- Use <p> for paragraphs; <ul>/<ol> for lists; <strong> for key sentences
- All links must be descriptive (avoid "here"); include alt text for any images referenced

ADDITIONAL FORMATTING & READER EXPERIENCE GUIDELINES - WHITE SPACE IS CRITICAL
- Add <br><br> after EVERY 2-3 paragraphs to create generous breathing room between text blocks
- Add <br><br> before and after every <h2>, <figure>, <blockquote>, <hr>, <ul>, and <ol> element
- EXCEPTION: After <h3> headers (like "Key Terms" and "References"), use only ONE <br> (not <br><br>)
- Keep paragraphs short (2-4 sentences) and focused on a single idea
- Use <strong> sparingly for emphasis (no more than 3-4 total per article)
- BLOCKQUOTE RULES (CRITICAL):
  * Blockquotes must be pull quotes - compelling or key sentences extracted from YOUR OWN article text
  * NEVER quote directly from the research paper (no author names, no technical paper language)
  * A blockquote should highlight an insight you've already written in simpler language
  * Include 1-2 blockquotes maximum
- Use <hr> no more than 1-2 times to separate major sections
- Enforce clear hierarchy: <h2> for main sections, <h3> for subsections; never stack headings without a paragraph between
- NO inline styles or colors; assume global CSS handles typography
- All links must be descriptive (e.g., "Read the full study"); avoid "click here"
- Every image must include meaningful alt text
- Keep lists concise (4-6 items) to preserve white space
- Alternate dense and light moments (text → quote/image → text) for smooth reading flow
- NEVER use explicit labels like "Analogy:", "Think about this:", "Key takeaway:" - integrate these naturally into flowing sentences
- The opening should feel visually light and inviting; avoid walls of text

EXACT STRUCTURE TO FOLLOW (INTERNAL GUIDANCE - DO NOT OUTPUT THESE SECTION LABELS):

1. TITLE (Micro Hook)
   - Clear, benefit-oriented or curiosity-driven
   - Grab attention immediately; no jargon

2. SUBTITLE (1-2 line Relatable Hook)
   - Quick personal/immediate touch OR surprising fact
   - Make it relevant to the reader's life

3. INTRODUCTION (100-150 words, 3 paragraphs)
   Paragraph 1: Scenario, question, anecdote, or surprising stat the reader can feel
   Paragraph 2: Briefly reveal the research/insight you'll discuss
   Paragraph 3: What the reader will get—why it's worth their time

4. BODY (400-700 words) — Create natural <h2> headings that fit the story:
   
   Section A (150-200 words) - INTERNAL PURPOSE: "What's Going On / Why It Matters"
      - Set up the problem, gap, or paradox
      - Introduce the study in everyday language
      - Show the status quo
      - Use one concrete example or metaphor integrated naturally (NEVER label it as "Analogy:")
      - Give this section a natural heading, NOT "What's Going On / Why It Matters"
   
   Section B (200-300 words) - INTERNAL PURPOSE: "The Discovery & Journey"
      - CRITICAL: Tell the story using "And, But, Therefore" STORYTELLING STRUCTURE (these words should NEVER appear in your output text):
        * First, establish the context/known facts
        * Then, introduce the surprise, contradiction, or problem
        * Finally, reveal the outcome or insight from the research
      - NEVER write the words "AND:", "BUT:", "THEREFORE:" in the actual article text
      - Briefly describe how researchers found the result (methods in plain English)
      - Give this section a natural heading, NOT "The Discovery & Journey"
   
   Section C (150-250 words) - INTERNAL PURPOSE: "What This Means / What's Next"
      - Translate findings into implications/applications for everyday life or society
      - Include "Limits of this study" integrated naturally (1-3 sentences, without labeling it)
      - Include "What we still don't know" integrated naturally (1-3 sentences, without labeling it)
      - Offer a small practical takeaway for the reader (integrated naturally, NEVER labeled as "Try this" or "Think about this")
      - Give this section a natural heading, NOT "What This Means / What's Next"

5. CONCLUSION + CALL-TO-ACTION (50-100 words)
   - One-sentence recap of the main insight
   - Why it matters for the reader
   - Simple invitation: comment, share, read the paper, or explore further

6. KEY TERMS (Plain English mini-glossary)
   - Provide 3-6 brief definitions for any unavoidable technical terms
   - Format as a simple list with <h3>Key Terms</h3>
   - Use only ONE <br> after the <h3> header (not <br><br>)

7. CITATIONS
   - List all referenced papers at the end with author(s), year, title, journal (if given), and DOI/URL
   - Format with <h3>References</h3>
   - Use only ONE <br> after the <h3> header (not <br><br>)
   - NO inline citations in the body text

Paper:
${paperContext}

Return your response as JSON with this structure:
{
  "title": "string (micro hook title)",
  "subtitle": "string (1-2 line relatable hook)", 
  "excerpt": "string (the introduction section)",
  "content": "string (full HTML starting from Body section through Citations, with proper <h2>, <h3>, <p>, <strong>, <ul>, <a> tags)",
  "reading_time_minutes": integer,
  "word_count": integer
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert science communicator who writes for high school students and non-scientists." },
        { role: "user", content: prompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_blog_post",
            description: "Create a science blog post with structured content",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Micro hook title" },
                subtitle: { type: "string", description: "1-2 line relatable hook" },
                excerpt: { type: "string", description: "The introduction section" },
                content: { type: "string", description: "Full HTML content from Body through Citations" },
                reading_time_minutes: { type: "integer", description: "Estimated reading time" },
                word_count: { type: "integer", description: "Total word count" }
              },
              required: ["title", "subtitle", "excerpt", "content", "reading_time_minutes", "word_count"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "create_blog_post" } }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Content generation error:", error);
    throw new Error(`Content generation failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices[0].message.tool_calls?.[0];
  
  if (!toolCall || !toolCall.function.arguments) {
    throw new Error("No tool call returned from AI");
  }

  const generatedContent = JSON.parse(toolCall.function.arguments);
  
  return generatedContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paperIds, subjectId } = await req.json();
    
    if (!paperIds || paperIds.length === 0) {
      throw new Error('No paper IDs provided');
    }

    // CRITICAL: Limit batch size to prevent timeout (edge functions have ~2 min limit)
    // Reduced to 5 to stay well under browser fetch timeout limits (~60-90 seconds)
    const MAX_BATCH_SIZE = 5;
    const tooManyPapers = paperIds.length > MAX_BATCH_SIZE;
    const limitedPaperIds = tooManyPapers ? paperIds.slice(0, MAX_BATCH_SIZE) : paperIds;

    console.log(`Generating blog posts for ${limitedPaperIds.length} papers${tooManyPapers ? ` (limited from ${paperIds.length})` : ''}`);

    const { data: papers, error: papersError } = await supabase
      .from('selected_papers')
      .select('*')
      .in('id', limitedPaperIds);

    if (papersError) throw papersError;
    if (!papers || papers.length === 0) throw new Error('Papers not found');

    // Check which papers already have blog posts by checking blog_posts.paper_ids arrays
    const { data: allBlogPosts, error: blogPostsError } = await supabase
      .from('blog_posts')
      .select('paper_ids');

    if (blogPostsError) {
      console.error('Error checking existing blog posts:', blogPostsError);
    }

    // Collect all paper IDs that are referenced in any blog post
    const existingPaperIds = new Set<string>();
    allBlogPosts?.forEach(post => {
      post.paper_ids?.forEach((paperId: string) => existingPaperIds.add(paperId));
    });
    
    // Filter out papers that already have blog posts
    const papersToGenerate = papers.filter(paper => !existingPaperIds.has(paper.id));
    
    if (papersToGenerate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All selected papers already have blog posts', 
          blogPosts: [], 
          count: 0,
          remainingPapers: tooManyPapers ? paperIds.length - MAX_BATCH_SIZE : 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating blog posts for ${papersToGenerate.length} new papers (skipping ${existingPaperIds.size} existing)`);

    // Group papers by article title to avoid duplicates across subjects
    const paperGroups = new Map<string, typeof papersToGenerate>();
    for (const paper of papersToGenerate) {
      const normalizedTitle = paper.article_title.toLowerCase().trim();
      if (!paperGroups.has(normalizedTitle)) {
        paperGroups.set(normalizedTitle, []);
      }
      paperGroups.get(normalizedTitle)!.push(paper);
    }

    console.log(`Grouped ${papersToGenerate.length} papers into ${paperGroups.size} unique titles`);

    const createdPosts = [];
    const errors = [];
    const startTime = Date.now();
    const TIMEOUT_MS = 100000; // 100 seconds timeout (leaving buffer before 120s edge function limit)

    // Generate one blog post per unique title (combining papers from multiple subjects)
    for (const [title, groupedPapers] of paperGroups.entries()) {
      // Check if we're approaching timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.log(`Timeout approaching after ${createdPosts.length} posts. Returning partial results.`);
        break;
      }
      try {
        // Use the first paper in the group as the source for content generation
        const primaryPaper = groupedPapers[0];
        const allPaperIds = groupedPapers.map(p => p.id);
        const allSubjectIds = [...new Set(groupedPapers.map(p => p.subject_id))];
        
        console.log(`Generating blog post for ${groupedPapers.length} paper(s) with title: "${primaryPaper.article_title}"`);
        console.log(`Paper IDs: ${allPaperIds.join(', ')}`);
        console.log(`Subject IDs: ${allSubjectIds.join(', ')}`);
        
        const generatedContent = await generateContent(primaryPaper);
        
        const readTime = generatedContent.reading_time_minutes || Math.ceil(generatedContent.content.split(' ').length / 200);

        // Use the first paper's selection_date as the publish_date
        const publishDate = primaryPaper.selection_date || new Date().toISOString();

        // Store NULL for hero_image_url - it will be determined dynamically when displaying
        const { data: blogPost, error: blogError } = await supabase
          .from('blog_posts')
          .insert({
            subject_id: primaryPaper.subject_id, // Keep for backwards compatibility
            subject_ids: allSubjectIds, // New: array of all subject IDs
            title: generatedContent.title,
            subtitle: generatedContent.subtitle,
            excerpt: generatedContent.excerpt,
            content: generatedContent.content,
            read_time: readTime,
            paper_ids: allPaperIds,
            hero_image_url: null, // Will be determined dynamically based on subject context
            status: 'draft',
            publish_date: publishDate
          })
          .select()
          .single();

        if (blogError) {
          console.error(`Failed to insert blog post for papers ${allPaperIds.join(', ')}:`, blogError);
          continue;
        }

        // Create paper citations for all papers in the group
        for (let i = 0; i < allPaperIds.length; i++) {
          await supabase.from('paper_citations').insert({
            blog_post_id: blogPost.id,
            selected_paper_id: allPaperIds[i],
            citation_order: i + 1
          });
        }

        createdPosts.push(blogPost);
        console.log(`Successfully generated blog post: ${blogPost.id} for ${groupedPapers.length} paper(s) (${createdPosts.length}/${paperGroups.size})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to generate blog post for paper group "${title}":`, errorMsg);
        errors.push({ title: title, error: errorMsg });
        // Continue with next paper group instead of failing completely
      }
    }

    const remainingInQueue = tooManyPapers ? paperIds.length - MAX_BATCH_SIZE : 0;
    const message = createdPosts.length > 0 
      ? `Successfully generated ${createdPosts.length} blog post${createdPosts.length > 1 ? 's' : ''}${errors.length > 0 ? ` (${errors.length} failed)` : ''}${remainingInQueue > 0 ? `. ${remainingInQueue} papers remaining - run again to continue.` : ''}`
      : `Failed to generate any blog posts. ${errors.length} error(s) occurred.`;

    return new Response(
      JSON.stringify({ 
        success: createdPosts.length > 0, 
        blogPosts: createdPosts, 
        count: createdPosts.length,
        errors: errors,
        remainingPapers: remainingInQueue,
        message: message
      }),
      { 
        status: createdPosts.length > 0 ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
