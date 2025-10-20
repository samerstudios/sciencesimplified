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

Return your response as JSON with this structure:
{
  "title": "string (clear, curiosity-driven title - no jargon)",
  "subtitle": "string (1-2 line relatable hook)", 
  "excerpt": "string (the introduction text)",
  "content": "string (full article content with clear section breaks, no HTML formatting)",
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
