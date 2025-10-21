import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  articleIds?: string[];
  testEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { articleIds, testEmail }: NewsletterRequest = await req.json();

    console.log("Fetching articles for newsletter:", articleIds);

    // Fetch articles
    let articlesQuery = supabase
      .from("blog_posts")
      .select("*, subjects:subject_id(name)")
      .eq("status", "published")
      .order("publish_date", { ascending: false });

    if (articleIds && articleIds.length > 0) {
      articlesQuery = articlesQuery.in("id", articleIds);
    } else {
      // Get articles from the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      articlesQuery = articlesQuery.gte("publish_date", weekAgo.toISOString());
    }

    const { data: articles, error: articlesError } = await articlesQuery;

    if (articlesError) throw articlesError;

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: "No articles found for newsletter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${articles.length} articles for newsletter`);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 32px; }
            .content { background: white; padding: 30px; }
            .article { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #eee; }
            .article:last-child { border-bottom: none; }
            .article h2 { color: #333; margin: 0 0 10px 0; font-size: 24px; }
            .article .category { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; }
            .article .excerpt { color: #666; line-height: 1.6; margin: 10px 0; }
            .article .read-more { display: inline-block; color: #667eea; text-decoration: none; font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
            .footer a { color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔬 ScienceSimplified Weekly</h1>
            <p>Your weekly dose of cutting-edge research made simple</p>
          </div>
          <div class="content">
            <p>Hi there! 👋</p>
            <p>Here are this week's most fascinating scientific discoveries, simplified just for you:</p>
            
            ${articles
              .map(
                (article: any) => `
              <div class="article">
                <span class="category">${article.subjects?.name || "Science"}</span>
                <h2>${article.title}</h2>
                <p class="excerpt">${article.excerpt}</p>
                <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace("supabase.co", "lovableproject.com")}/article/${article.id}" class="read-more">Read the full story →</a>
              </div>
            `
              )
              .join("")}
            
            <p style="margin-top: 30px;">
              That's all for this week! We hope you enjoyed these scientific insights.
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because you subscribed to ScienceSimplified.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `;

    // Get subscribers or use test email
    let recipients: string[] = [];
    
    if (testEmail) {
      recipients = [testEmail];
      console.log("Sending test newsletter to:", testEmail);
    } else {
      const { data: subscribers, error: subscribersError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);

      if (subscribersError) throw subscribersError;

      recipients = subscribers.map((sub: any) => sub.email);
      console.log(`Sending newsletter to ${recipients.length} subscribers`);
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active subscribers found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        const { error: emailError } = await resend.emails.send({
          from: "ScienceSimplified <onboarding@resend.dev>",
          to: batch,
          subject: `🔬 This Week in Science: ${articles[0].title}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error("Error sending batch:", emailError);
        } else {
          sentCount += batch.length;
        }
      } catch (error) {
        console.error("Error sending batch:", error);
      }
    }

    console.log(`Newsletter sent successfully to ${sentCount} recipients`);

    return new Response(
      JSON.stringify({
        success: true,
        articleCount: articles.length,
        recipientCount: sentCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);