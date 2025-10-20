import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateContent(papers: any[]): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  const papersContext = papers.map((p, i) => 
    `Paper ${i + 1}: "${p.article_title}"\nAuthors: ${p.authors}\nJournal: ${p.journal_name}\nAbstract: ${p.abstract}\n`
  ).join('\n---\n');

const prompt = `You are a science communicator writing for high school students and general readers with NO science background. This is a "Paper of the Week" blog post that explains the single most important recent finding in this field.

PAPER USAGE (CRITICAL)
- You have been provided with 1 breakthrough paper - the most important finding from this week
- Your goal is to explain this single discovery in an engaging, accessible way
- This is NOT a review of multiple studies - focus entirely on this ONE paper's findings

AUDIENCE & STYLE RULES
- Reading level: high school (ages 14–18)
- Use ZERO jargon without an immediate plain-English explanation
- Prefer everyday language and relatable analogies (label analogies clearly with "Analogy:")
- Short paragraphs (2–4 sentences), active voice, conversational tone
- First person is allowed where it improves relatability
- Length target: 600–1,000 words (≈5–10 minute read)
- This should read like an ENGAGING STORY, not a structured academic paper

SOURCE-OF-TRUTH (CRITICAL)
- Use ONLY information contained in the papers provided below
- Do NOT invent facts or numbers
- If a needed detail is missing, say so briefly and move on. Do not speculate
- Since you're writing about ONE paper, do NOT include inline citations like "(Author et al., Year)" - the full citation at the end is sufficient

OUTPUT FORMAT (CRITICAL FOR READABILITY)
- Deliver valid HTML only (no Markdown)
- Use <h2> for main section headings; <h3> for subsections when needed
- Use <p> for EVERY paragraph - each paragraph should be wrapped in <p> tags
- Keep paragraphs SHORT (2-4 sentences maximum per <p> tag)
- Use <strong> to emphasize key terms, findings, and important concepts
- Use <em> for introducing technical terms before explaining them
- Use <ul> or <ol> for any lists of items (3+ related points)
- All links must be descriptive (avoid "here"); include alt text for any images referenced
- IMPORTANT: Structure content for maximum readability with clear visual breaks

EXACT STRUCTURE TO FOLLOW

1. TITLE (Micro Hook)
   - Clear, benefit-oriented or curiosity-driven
   - Grab attention immediately; no jargon
   - Focus on the breakthrough/discovery

2. SUBTITLE (1–2 line Relatable Hook)
   - Quick personal/immediate touch OR surprising fact
   - Make it relevant to the reader's life

3. INTRODUCTION (100–150 words, 3 separate <p> tags)
   - Paragraph 1: Hook with a scenario, question, or surprising stat
   - Paragraph 2: Introduce this week's breakthrough discovery
   - Paragraph 3: Why this matters to the reader
   - Each paragraph MUST be in its own <p> tag with space between them

4. BODY (400–700 words) — use clear <h2> headings:

   <h2>The Problem / Why Scientists Cared</h2>
   - Write 4-6 SHORT paragraphs (each in its own <p> tag)
   - Set up the challenge or question scientists were trying to solve
   - Explain the gap in knowledge or the puzzle that existed
   - Use concrete examples or analogies to make it tangible (label as "Analogy:")
   - Why was this important to figure out?
   - Break up dense information into digestible chunks

   <h2>The Breakthrough</h2>
   - Write 5-8 SHORT paragraphs (each in its own <p> tag)
   - Tell the story of what researchers discovered
   - Describe the approach/methods in plain English (separate paragraph)
   - Explain the key findings clearly (1-2 paragraphs, each focused on ONE finding)
   - Build excitement around the "aha moment"
   - Use <strong> to highlight key discoveries and findings
   - Keep it flowing naturally as a story, not a formal report

   <h2>What This Means for Us</h2>
   - Write 4-6 SHORT paragraphs (each in its own <p> tag)
   - Real-world implications and applications (2-3 paragraphs)
   - How this could affect everyday life, medicine, technology, or society
   - Separate paragraph for <strong>Limitations:</strong> (what this study doesn't answer)
   - Separate paragraph for <strong>What's next:</strong> (future research directions)

5. CONCLUSION (50–100 words)
   - One-sentence recap of the breakthrough
   - Why this week's finding matters
   - Simple invitation to engage (share, discuss, learn more)

6. KEY TERMS (Plain English mini-glossary)
   - Provide 3–5 brief definitions for any technical terms used

7. CITATION
   - Full citation with authors, year, title, journal, and DOI/URL at the end
   - No inline citations needed since you're discussing a single paper

8. RESPONSIBLE SCIENCE NOTE (if applicable)
   - If topic involves health, environment, or safety, add 1–2 sentences on considerations

Papers:
${papersContext}

Return your response as JSON with this structure:
{
  "title": "string (micro hook title)",
  "subtitle": "string (1-2 line relatable hook)", 
  "excerpt": "string (the introduction section)",
  "content": "string (full HTML starting from Body section through Citations, with proper <h2>, <h3>, <p>, <strong>, <ul>, <a> tags)",
  "reading_time_minutes": integer,
  "word_count": integer,
  "tags": ["science", "<domain>", "explain-like-I'm-15"],
  "sources_used": ["<first author year>"]
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
        { role: "system", content: "You are an expert science communicator who writes for high school students and non-scientists. Your writing is clear, jargon-free, and uses everyday language with relatable analogies. You make complex science exciting and accessible." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Lovable AI error:", error);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return content;
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
    
    const readTime = Math.ceil(generatedContent.content.split(' ').length / 200);

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
