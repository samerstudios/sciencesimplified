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

  const prompt = `You are a science communicator writing for high school students and general readers with NO science background. Create an ENGAGING STORY-DRIVEN blog post following this exact structure:

CRITICAL WRITING RULES:
- Write at a high school reading level (ages 14-18)
- Use ZERO scientific jargon without explanation
- Replace technical terms with everyday language and relatable analogies
- Use short paragraphs (2-4 sentences each)
- Active voice and conversational tone
- Use first person where appropriate for relatability

EXACT STRUCTURE TO FOLLOW:

1. TITLE (Micro Hook)
   - Clear, benefit-oriented or curiosity-driven
   - Grab attention immediately
   - NO jargon
   - Signal relevance and spark curiosity

2. SUBTITLE (1-2 line Relatable Hook)
   - Quick personal/immediate touch OR surprising fact
   - Make it feel relevant to the reader's life

3. INTRODUCTION (100-150 words, 3 paragraphs)
   Paragraph 1: Hook with a scenario, question, anecdote or surprising stat the reader can feel
   Paragraph 2: Briefly reveal the research/insight you'll discuss
   Paragraph 3: What the reader will get — why it's worth their time

4. BODY (400-700 words) — Use clear <h2> headings for each subsection:
   
   A. "What's Going On / Why It Matters" (150-200 words)
      - Set up the problem, gap, or paradox
      - Introduce the study in everyday language
      - Show the status quo
      - Use examples/metaphors to make it concrete
   
   B. "The Discovery & Journey" (200-300 words)
      - Make the science feel like a story using "And, But, Therefore":
        * AND: Start with established fact/context
        * BUT: Introduce the surprise or problem
        * THEREFORE: Shift to the outcome/insight
      - Show how researchers found the result
   
   C. "What This Means / What's Next" (150-250 words)
      - Translate findings into implications and applications
      - Make it relevant to the reader's world
      - Discuss remaining questions or limitations
      - Offer a "what you can do/think about" angle

5. CONCLUSION + CALL-TO-ACTION (50-100 words)
   - One-sentence recap of main insight
   - Why it matters for the reader
   - Simple invitation: comment, explore further, etc.

6. CITATIONS
   - End with proper citations of the papers referenced

FORMATTING:
- Use <h2> for main section headings
- Use <h3> for subsection headings if needed
- Keep paragraphs short (2-4 sentences)
- Use <ul> or <ol> for lists when introducing multiple points
- Bold key sentences with <strong>
- Use <p> tags for paragraphs
- Include <a> hyperlinks to reference papers naturally in text

Papers:
${papersContext}

Return your response as JSON with this structure:
{
  "title": "string (micro hook title)",
  "subtitle": "string (1-2 line relatable hook)", 
  "excerpt": "string (the introduction section)",
  "content": "string (full HTML starting from Body section through Citations, with proper <h2>, <h3>, <p>, <strong>, <ul>, <a> tags)"
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
