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

const prompt = `You are a world-class science communicator writing for The Atlantic, Wired, or Scientific American. Your readers are curious high school students and general readers with NO science background who want to understand cutting-edge research.

═══════════════════════════════════════════════════
CRITICAL HTML FORMATTING RULES (NON-NEGOTIABLE)
═══════════════════════════════════════════════════

EVERY PARAGRAPH = ONE <p> TAG. NO EXCEPTIONS.

❌ WRONG - Multiple sentences without paragraph tags:
Scientists discovered a new mechanism. This is important. It could change treatment.

✅ CORRECT - Each idea gets its own <p> tag:
<p>Scientists discovered a new mechanism that nobody expected.</p>

<p>This finding is important because it challenges everything we thought we knew about the disease.</p>

<p>It could fundamentally change how doctors approach treatment in the next decade.</p>

SPACING RULE: The CSS will automatically add spacing between <p> tags. You ONLY need to write proper HTML structure.

═══════════════════════════════════════════════════
EMPHASIS & VISUAL HIERARCHY
═══════════════════════════════════════════════════

Use <strong> for KEY concepts, findings, and important terms (sparingly - only 3-5 times per section):
<p>The researchers found that <strong>GZMK-expressing CD8+ T cells</strong> were the culprits driving recurrent inflammation.</p>

Use <em> when first introducing a technical term before explaining it:
<p>These <em>memory T cells</em> (immune cells that remember past encounters) were behaving strangely.</p>

═══════════════════════════════════════════════════
PARAGRAPH LENGTH RULES
═══════════════════════════════════════════════════

MAXIMUM: 3 sentences per paragraph
IDEAL: 1-2 sentences per paragraph
Break up complex ideas into bite-sized chunks

❌ WRONG - Dense paragraph:
<p>Think about a common cold. You get sick, your body fights it off, and eventually, you get better. But for people with diseases like chronic rhinosinusitis (which means a really long-lasting stuffy nose and sinus pain) or asthma, it's not that simple. These conditions are called inflammatory diseases, and they often come back again and again, even after treatments.</p>

✅ CORRECT - Broken into digestible pieces:
<p>Think about a common cold. You get sick, your body fights it off, and you get better.</p>

<p>But for people with <em>chronic rhinosinusitis</em> (long-lasting stuffy nose and sinus pain) or asthma, it's not that simple. These conditions keep coming back, even after treatment.</p>

<p>Scientists call these <strong>recurrent inflammatory diseases</strong>, and for years, they've been a mystery.</p>

═══════════════════════════════════════════════════
CONTENT STRUCTURE REQUIREMENTS
═══════════════════════════════════════════════════

PAPER USAGE (CRITICAL):
- You have 1 breakthrough paper - explain this ONE discovery
- No inline citations like "(Author et al., Year)" - full citation at the end only
- Use ONLY information from the paper provided - no speculation

AUDIENCE:
- Reading level: high school (ages 14-18)
- ZERO jargon without immediate plain-English explanation
- Relatable analogies (label as "Analogy:")
- Conversational, engaging tone (like explaining to a curious friend)
- Length: 600-1,000 words

═══════════════════════════════════════════════════
EXACT HTML STRUCTURE TO OUTPUT
═══════════════════════════════════════════════════

<h2>The Problem / Why Scientists Cared</h2>

<p>[Hook sentence that sets up the problem]</p>

<p>[Expand on why this problem exists]</p>

<p>[Analogy: Real-world comparison that makes it tangible]</p>

<p>[Why solving this matters - the stakes]</p>

<p>[Impact statistics or broader context]</p>

<h2>The Breakthrough</h2>

<p>[What researchers set out to discover]</p>

<p>[Brief description of their approach in plain English]</p>

<p>[The key finding - the "aha moment"]</p>

<p>[Specific evidence or data that proves it]</p>

<p>[Why this finding is unexpected or important]</p>

<p>[Additional supporting findings if relevant]</p>

<p>[Validation through experiments or models]</p>

<h2>What This Means for Us</h2>

<p>[Immediate practical implications]</p>

<p>[How this could change treatments/technology/understanding]</p>

<p>[Who benefits from this discovery]</p>

<p>[Timeline for real-world impact]</p>

<p><strong>Limitations:</strong> [What questions remain unanswered]</p>

<p><strong>What's next:</strong> [Future research directions]</p>

<h2>Conclusion</h2>

<p>[One-sentence recap of the breakthrough and why it matters]</p>

<p>[Forward-looking statement about impact]</p>

<h2>Key Terms</h2>

<ul>
<li><strong>Term 1:</strong> Plain English definition</li>
<li><strong>Term 2:</strong> Plain English definition</li>
<li><strong>Term 3:</strong> Plain English definition</li>
</ul>

<h2>Citation</h2>

<p>[Authors]. ([Year]). [Title]. <em>[Journal]</em>. DOI: [doi]</p>

═══════════════════════════════════════════════════

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
