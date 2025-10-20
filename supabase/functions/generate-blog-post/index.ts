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

  // STEP 1: Generate raw content
  const contentPrompt = `You are a world-class science communicator writing for The Atlantic, Wired, or Scientific American. Your readers are curious high school students and general readers with NO science background who want to understand cutting-edge research.

AUDIENCE:
- Reading level: high school (ages 14-18)
- ZERO jargon without immediate plain-English explanation
- Relatable analogies when helpful
- Conversational, engaging tone (like explaining to a curious friend)
- Length: 600-1,000 words

CONTENT REQUIREMENTS:
- Use ONLY information from the paper provided - no speculation
- No inline citations like "(Author et al., Year)" - full citation at the end only
- Break complex ideas into digestible pieces
- Keep paragraphs short (2-3 sentences max)

REQUIRED STRUCTURE:

INTRODUCTION:
- Open with a relatable scenario, question, or surprising fact
- Reveal the research insight in plain English
- Explain why this discovery matters to the reader

SECTION: The Problem / Why Scientists Cared
- Hook sentence that sets up the problem
- Explain why this problem exists
- Use a real-world comparison to make it tangible
- Explain the stakes - why solving this matters
- Provide impact statistics or broader context

SECTION: The Breakthrough
- What researchers set out to discover
- Brief description of their approach in plain English
- The key finding - the "aha moment"
- Specific evidence or data that proves it
- Why this finding is unexpected or important
- Additional supporting findings if relevant
- Validation through experiments or models

SECTION: What This Means for Us
- Immediate practical implications
- How this could change treatments/technology/understanding
- Who benefits from this discovery
- Timeline for real-world impact
- Limitations: What questions remain unanswered
- What's next: Future research directions

CONCLUSION:
- One-sentence recap of the breakthrough and why it matters
- Forward-looking statement about impact

KEY TERMS:
- List 3-5 technical terms with plain English definitions

CITATION:
- Full citation with authors, year, title, journal, and DOI

Papers:
${papersContext}

Return ONLY the raw text content with clear section markers. No HTML, no formatting.`;

  const contentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert science communicator who writes for high school students and non-scientists." },
        { role: "user", content: contentPrompt }
      ],
    }),
  });

  if (!contentResponse.ok) {
    const error = await contentResponse.text();
    console.error("Content generation error:", error);
    throw new Error(`Content generation failed: ${contentResponse.status}`);
  }

  const contentData = await contentResponse.json();
  const rawContent = contentData.choices[0].message.content;

  // STEP 2: Format the content into polished HTML
  const formattingPrompt = `You are a professional science communicator writing for high school students and general readers with NO technical background.  
Your task: Transform the input scientific content into a visually stunning, story-driven, and educational science blog post for a top-tier publication.

The final post must be written in polished HTML and be immediately publishable on a professional website.  
It must follow the exact structure, narrative, and formatting system below — no deviations.

===========================================================
INPUT
===========================================================

Scientific papers or summarized content to base the blog post on:
${papersContext}

Raw content to format:
${rawContent}

===========================================================
STYLE, VOICE, & CONTENT RULES
===========================================================

- Audience: Intelligent non-specialists (ages 14–18 and general readers).  
- Reading level: High school.  
- Tone: Conversational, curious, cinematic, and story-driven.  
- Voice: Active, human, occasionally first-person for warmth.  
- Avoid jargon entirely. If unavoidable, explain it immediately in simple terms.  
- Use analogies labeled "Analogy:" where helpful for understanding.  
- Word count: 600–1,000 words (≈5–10 minute read).  
- Paragraph length: 2–4 sentences maximum.  
- No walls of text — break ideas visually.  
- Focus on emotional engagement, narrative pacing, and clarity.  
- Do not invent data; base all content strictly on the papers and raw content provided.  
- Attribute insights with inline hyperlinks to the cited paper(s).  
- Use transparent, honest phrasing (e.g., "Researchers suggest…" instead of "proved").  

===========================================================
STRUCTURE (MANDATORY ORDER)
===========================================================

<html>
<body>

<!-- meta: reading_time=<integer>min word_count=<integer> tags="science,<topic>,feature" -->

<h1 class="post-title">[TITLE — clear, curiosity-driven, no jargon]</h1>
<h2 class="post-subtitle">[1–2 line relatable or emotional hook]</h2>

<figure class="feature-image">
  <img src="[RELEVANT_IMAGE_URL]" alt="[Descriptive alt text]" />
  <figcaption>[Short caption linking the image to the article's main theme]</figcaption>
</figure>

<!-- INTRODUCTION -->
<section class="introduction">
  <p class="readable">Paragraph 1: Relatable scenario, question, anecdote, or surprising stat the reader can feel.</p>
  <p class="readable">Paragraph 2: Reveal the research or discovery you'll discuss, in plain English.</p>
  <p class="readable">Paragraph 3: Explain why this matters — what the reader will gain or learn.</p>
</section>

<hr class="section-divider" />

<!-- BODY -->
<section class="body">

  <h2 class="post-heading">A. What's Going On / Why It Matters</h2>
  <p class="readable">Set up the problem, gap, or paradox. Introduce the study in everyday language and context. Include one clear "Analogy:" to make the concept tangible.</p>
  <blockquote class="pull-quote readable">"Include one thought-provoking sentence or quote that emotionally captures this section."</blockquote>

  <h2 class="post-heading">B. The Discovery & Journey</h2>
  <p class="readable">Tell the story of discovery using the 'And, But, Therefore' narrative model:</p>
  <ul class="readable">
    <li><strong>AND:</strong> State the known background or conventional belief.</li>
    <li><strong>BUT:</strong> Introduce the surprising finding, challenge, or twist.</li>
    <li><strong>THEREFORE:</strong> Reveal the new insight, result, or implication.</li>
  </ul>
  <p class="readable">Describe the research process briefly in plain language — methods, challenges, and "aha" moments.</p>

  <blockquote class="pull-quote readable">"Include a visually resting key insight or memorable quote from this section."</blockquote>

  <h2 class="post-heading">C. What This Means / What's Next</h2>
  <p class="readable">Translate the findings into real-world implications — policy, technology, environment, or human life. Make it relevant to readers' daily lives or future thinking.</p>
  <ul class="readable">
    <li><strong>Limits of this study:</strong> 1–3 honest sentences explaining uncertainty or scope.</li>
    <li><strong>What we still don't know:</strong> 1–3 sentences sparking curiosity or next questions.</li>
    <li><strong>Takeaway:</strong> One reflective sentence ("Next time you look at…" / "Imagine if…").</li>
  </ul>

</section>

<hr class="section-divider" />

<!-- CONCLUSION -->
<section class="conclusion">
  <p class="readable"><strong>One-sentence recap</strong> of the central takeaway.</p>
  <p class="readable">Why it matters to the reader's life or worldview.</p>
  <p class="readable">Simple invitation: comment, share, or read further.</p>
</section>

<!-- GLOSSARY -->
<aside class="glossary">
  <h3>Key Terms (Plain English)</h3>
  <ul>
    <li>Term 1 — 1-line simple definition.</li>
    <li>Term 2 — 1-line simple definition.</li>
  </ul>
</aside>

<!-- FURTHER READING -->
<div class="further-reading">
  <h3>Further Reading</h3>
  <ul>
    <li><a href="[paper1_link]" target="_blank">Paper Title (Author, Year) — Journal</a></li>
  </ul>
</div>

<p class="back-to-top"><a href="#top">Back to top ↑</a></p>

</body>
</html>

===========================================================
DESIGN, AESTHETIC & SPACING RULES
===========================================================

🟩 **Whitespace & Flow**
- Insert blank lines before every <h2>, <figure>, and after every list (<ul>/<ol>).
- Maintain 50–60% text density per viewport (balanced white space).
- Never exceed 4 paragraphs without a visual break (image, quote, divider).
- Line height: 1.7; characters per line: 60–80.
- Each scroll should include a "visual anchor" (image, pull-quote, or section divider).

🟩 **Typography**
- Apply class="readable" to <p>, <h2>, <blockquote> for spacing and line-height consistency.
- No inline CSS styling; classes only.
- Avoid italics for emphasis; use <strong> sparingly (max 3–4 per article).
- Use <blockquote class="pull-quote"> for 1–2 highlighted sentences.

🟩 **Color & Brand Consistency**
- Use <aside class="glossary"> and <div class="further-reading"> to visually separate supportive content.
- Glossary background: subtle secondary tone (defined in CSS).
- Maintain calm, minimalist color palette (neutral backgrounds, legible text).

🟩 **Mobile Responsiveness**
- All elements must stack vertically with sufficient padding.
- Base font: 18–20px mobile, 20–22px desktop.
- Avoid more than one level of list nesting.
- Ensure all links and buttons are touch-friendly.

🟩 **Accessibility & SEO**
- Every <img> must have descriptive alt text.
- Links must be descriptive ("Read the full paper" not "click here").
- Use semantic HTML tags (<figure>, <aside>, <blockquote>) for better search visibility.
- One <h1> only.
- Meta comment (at top) includes reading time and tags for CMS parsing.

🟩 **Cognitive Rest Design**
- Include at least one pull-quote and one divider per 500 words.
- Alternate dense and light sections to reduce fatigue.
- Never start or end with a wall of text.
- Keep early scroll area (<500px) visually light and inviting.

🟩 **End-of-Post Navigation**
- Always include:
  <p class="back-to-top"><a href="#top">Back to top ↑</a></p>

===========================================================
OUTPUT REQUIREMENTS
===========================================================

Return your response as JSON with this structure:
{
  "title": "string (clear, curiosity-driven title - no jargon)",
  "subtitle": "string (1-2 line relatable hook)", 
  "excerpt": "string (the introduction section as HTML)",
  "content": "string (full HTML article body from first <h2> through back-to-top link)",
  "reading_time_minutes": integer,
  "word_count": integer,
  "tags": ["science", "<domain>", "storytelling"],
  "sources_used": ["<FirstAuthor_Year>"]
}`;

  const formattingResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert HTML formatter who transforms science content into beautiful, accessible, and engaging blog posts." },
        { role: "user", content: formattingPrompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!formattingResponse.ok) {
    const error = await formattingResponse.text();
    console.error("Formatting error:", error);
    throw new Error(`Formatting failed: ${formattingResponse.status}`);
  }

  const formattingData = await formattingResponse.json();
  const formattedContent = JSON.parse(formattingData.choices[0].message.content);
  
  return formattedContent;
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
