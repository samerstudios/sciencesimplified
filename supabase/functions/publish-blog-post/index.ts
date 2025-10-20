import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { blogPostId } = await req.json();
    
    if (!blogPostId) {
      throw new Error('Blog post ID required');
    }

    console.log(`Publishing blog post: ${blogPostId}`);

    // Get the blog post with its associated paper to get the selection date
    const { data: postData, error: fetchError } = await supabase
      .from('blog_posts')
      .select(`
        *,
        paper_citations (
          selected_papers (
            selection_date
          )
        )
      `)
      .eq('id', blogPostId)
      .single();

    if (fetchError) throw fetchError;

    // Use the paper's selection date as the publish date
    const publishDate = postData?.paper_citations?.[0]?.selected_papers?.selection_date || new Date().toISOString();

    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .update({ 
        status: 'published',
        publish_date: publishDate
      })
      .eq('id', blogPostId)
      .select()
      .single();

    if (error) throw error;

    console.log(`Successfully published blog post: ${blogPost.title}`);

    return new Response(
      JSON.stringify({ success: true, blogPost }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in publish-blog-post function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
