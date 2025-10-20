import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateContent(papers: any[]): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  const papersContext = papers.map((p, i) => 
    `Paper ${i + 1}: "${p.article_title}"\nAuthors: ${p.authors}\nJournal: ${p.journal_name}\nDOI: ${p.doi}\nAbstract: ${p.abstract}\n`
  ).join('\n---\n');

  const prompt = `You are a science communicator writing for high school students and general readers with NO science background. Produce an ENGAGING, STORY-DRIVEN science blog post strictly based on the provided Papers.

AUDIENCE & STYLE RULES
- Reading level: high school (ages 14-18)
- Use ZERO jargon without an immediate plain-English explanation
- Prefer everyday language and relatable analogies (label analogies clearly as "Analogy:")
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

ADDITIONAL FORMATTING & READER EXPERIENCE GUIDELINES
- Add <p><br></p> between major sections (before each <h2>) to create visual breathing room
- Add <p><br></p> before and after each <figure>, <blockquote>, and <hr> element
- Limit consecutive paragraphs to 3–4 before adding a visual break (use <blockquote>, <figure>, or <hr>)
- Keep paragraphs short (2–4 sentences) and focused on a single idea for scan-ability
- Use <strong> sparingly for emphasis (no more than 3–4 total per article)
- Include 1–2 <blockquote> elements as pull quotes to provide cognitive rest and visual pacing
- Use <hr> no more than 1–3 times to separate major sections without visual clutter
- Enforce a clear hierarchy: <h2> for main sections, <h3> for subsections; never stack headings without an intervening paragraph
- Avoid inline styles or colors; assume global site CSS manages typography and spacing
- All links must be descriptive (e.g., "Read the full study"); avoid "click here"
- Every image must include meaningful alt text describing the content or purpose
- Optimize for mobile: no wide tables, no deeply nested lists, no long unbroken URLs
- Keep lists concise (4–6 items) to preserve white space and prevent visual fatigue
- Alternate dense and light moments (paragraph clusters → quote/image → paragraph clusters) to maintain smooth reading flow
- The first screen (title → subtitle → opening paragraph) should feel visually light and inviting; never begin or end with a wall of text

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
      - Use one concrete example or metaphor (label as "Analogy:")
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
      - Include "Limits of this study" (1-3 sentences)
      - Include "What we still don't know" (1-3 sentences)
      - Offer a small "Try this / Think about this" takeaway for the reader
      - Give this section a natural heading, NOT "What This Means / What's Next"

5. CONCLUSION + CALL-TO-ACTION (50-100 words)
   - One-sentence recap of the main insight
   - Why it matters for the reader
   - Simple invitation: comment, share, read the paper, or explore further

6. KEY TERMS (Plain English mini-glossary)
   - Provide 3-6 brief definitions for any unavoidable technical terms
   - Format as a simple list with <h3>Key Terms</h3>

7. CITATIONS
   - List all referenced papers at the end with author(s), year, title, journal (if given), and DOI/URL
   - Format with <h3>References</h3>
   - NO inline citations in the body text

Papers:
${papersContext}

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
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Content generation error:", error);
    throw new Error(`Content generation failed: ${response.status}`);
  }

  const data = await response.json();
  const generatedContent = JSON.parse(data.choices[0].message.content);
  
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

    console.log(`Generating blog post for ${paperIds.length} papers`);

    const { data: papers, error: papersError } = await supabase
      .from('selected_papers')
      .select('*')
      .in('id', paperIds);

    if (papersError) throw papersError;
    if (!papers || papers.length === 0) throw new Error('Papers not found');

    const generatedContent = await generateContent(papers);
    
    const readTime = generatedContent.reading_time_minutes || Math.ceil(generatedContent.content.split(' ').length / 200);

    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .insert({
        subject_id: subjectId,
        title: generatedContent.title,
        subtitle: generatedContent.subtitle,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        read_time: readTime,
        paper_ids: paperIds,
        status: 'draft'
      })
      .select()
      .single();

    if (blogError) throw blogError;

    const citations = paperIds.map((paperId: string, index: number) => ({
      blog_post_id: blogPost.id,
      selected_paper_id: paperId,
      citation_order: index + 1
    }));

    await supabase.from('paper_citations').insert(citations);

    console.log(`Successfully generated blog post: ${blogPost.id}`);

    return new Response(
      JSON.stringify({ success: true, blogPost }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
