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

const prompt = `You are a professional science communicator writing for high school students and general readers with NO science background.
Your mission is to create an ENGAGING, STORY-DRIVEN blog post based entirely on the provided scientific papers.

═══════════════════════════════════════════════════
AUDIENCE & STYLE
═══════════════════════════════════════════════════

- Audience: intelligent non-experts (ages 14–18 and general readers)
- Reading level: high school
- Tone: conversational, clear, curious, story-driven
- Voice: active, confident, occasionally first-person for warmth
- Jargon: ZERO unexplained terms — every technical word must be simplified
- Analogies: encouraged (label as "Analogy:")
- Paragraphs: 2–3 sentences max
- Word count: 600–1,000 words (≈5–8 minute read)
- Write like you're explaining to a curious friend

═══════════════════════════════════════════════════
NARRATIVE STRUCTURE: "AND, BUT, THEREFORE"
═══════════════════════════════════════════════════

Tell the research story using this proven structure:

AND: Set up what we knew or believed
BUT: Introduce the surprise, problem, or gap
THEREFORE: Reveal the discovery and what it means

This creates natural narrative tension and keeps readers engaged.

═══════════════════════════════════════════════════
HTML FORMATTING RULES
═══════════════════════════════════════════════════

EVERY paragraph = ONE <p> tag
Use semantic class names for styling:
- <h2 class="post-heading"> for major sections
- <p class="readable"> for all body text
- <blockquote class="pull-quote"> for standout sentences (use 1–2 per article)
- <strong> for key concepts (use sparingly — 3–5 per section)
- <em> when introducing technical terms

White space rules:
- Blank line before each <h2> and after <blockquote>
- Never put more than 3 paragraphs without a visual break
- Use <hr class="section-divider" /> between major sections

═══════════════════════════════════════════════════
REQUIRED STRUCTURE
═══════════════════════════════════════════════════

INTRODUCTION (≈100–150 words; 3 paragraphs):

<p class="readable">[Open with a relatable scenario, question, or surprising fact]</p>

<p class="readable">[Reveal the research insight you'll discuss in plain English]</p>

<p class="readable">[Why this discovery matters to the reader's world]</p>

BODY SECTIONS:

<h2 class="post-heading">What's Going On / The Problem</h2>

<p class="readable">[AND: Set up the context or established belief]</p>

<p class="readable">[Explain why this problem exists or why scientists cared]</p>

<p class="readable">[Use one clear example or Analogy: to make it concrete]</p>

<h2 class="post-heading">The Discovery</h2>

<p class="readable">[BUT: Introduce what researchers found that was surprising]</p>

<p class="readable">[Describe their approach in everyday language]</p>

<p class="readable">[THEREFORE: The key finding — the "aha moment"]</p>

<blockquote class="pull-quote">[One memorable sentence capturing the breakthrough]</blockquote>

<p class="readable">[Specific evidence or data that proves it]</p>

<p class="readable">[Additional supporting findings if relevant]</p>

<hr class="section-divider" />

<h2 class="post-heading">What This Means</h2>

<p class="readable">[Translate findings into real-world implications]</p>

<p class="readable">[How this could change treatments/technology/understanding]</p>

<p class="readable">[Who benefits and when]</p>

<p class="readable"><strong>Limitations:</strong> [What questions remain — be honest about uncertainty]</p>

<p class="readable"><strong>What's next:</strong> [Future research directions that spark curiosity]</p>

CONCLUSION:

<h2 class="post-heading">The Takeaway</h2>

<p class="readable">[One-sentence recap of the breakthrough and its significance]</p>

<p class="readable">[Why it matters to the reader — give them something to think about]</p>

KEY TERMS & CITATION:

<aside class="glossary">
<h3>Key Terms</h3>
<ul>
<li><strong>Term 1:</strong> Plain English definition</li>
<li><strong>Term 2:</strong> Plain English definition</li>
<li><strong>Term 3:</strong> Plain English definition</li>
</ul>
</aside>

<div class="further-reading">
<h3>Citation</h3>
<p>[Authors] ([Year]). [Title]. <em>[Journal]</em>. DOI: <a href="[doi_url]" target="_blank">[doi]</a></p>
</div>

═══════════════════════════════════════════════════
CRITICAL CONSTRAINTS
═══════════════════════════════════════════════════

- Use ONLY information from the papers provided
- Do NOT fabricate data, quotes, or names
- If something is unclear, acknowledge it gracefully
- Every claim must be traceable
- No inline citations like "(Author et al., Year)"

═══════════════════════════════════════════════════

Papers:
${papersContext}

Return your response as JSON with this structure:
{
  "title": "string (clear, benefit-oriented or curiosity-driven — no jargon)",
  "subtitle": "string (1-2 lines with emotional or practical relevance)", 
  "excerpt": "string (the full introduction section as HTML)",
  "content": "string (full HTML body starting from first <h2> through citation, with all proper tags and class names)",
  "reading_time_minutes": integer,
  "word_count": integer,
  "tags": ["science", "<topic>", "storytelling"],
  "sources_used": ["<FirstAuthor_Year>"]
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
