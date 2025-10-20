import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const { data: post } = await supabase
          .from("blog_posts")
          .select("*, subjects(name)")
          .eq("id", id)
          .eq("status", "published")
          .single();

        if (post) {
          setArticle(post);

          const { data: citations } = await supabase
            .from("paper_citations")
            .select("selected_papers(*)")
            .eq("blog_post_id", id)
            .order("citation_order");

          if (citations) {
            setPapers(citations.map(c => c.selected_papers));
          }
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 lg:px-12 py-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Article not found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="animate-fade-in">
        {/* Hero Image */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-muted">
          <img 
            src={article.hero_image_url || "/quantum.jpg"} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-6 lg:px-12 -mt-32 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card shadow-elegant rounded-lg p-8 md:p-12 mb-12">
              {/* Back Button */}
              <Link to="/" className="inline-block mb-6">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Articles
                </Button>
              </Link>

              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge className="bg-gradient-accent text-accent-foreground">
                  {article.subjects?.name || "Science"}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{article.read_time} min read</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.publish_date || article.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <div 
                  className="text-lg leading-relaxed text-foreground/90 mb-12 pb-8 border-b border-border
                    prose prose-lg max-w-none
                    prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
                    [&>br]:block [&>br]:my-2"
                  dangerouslySetInnerHTML={{ __html: article.excerpt }}
                />
              )}

              {/* Article Content */}
              <div 
                className="prose prose-lg md:prose-xl max-w-none
                  prose-headings:font-serif prose-headings:font-bold prose-headings:text-primary
                  prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight
                  prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-6
                  prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-em:text-foreground/80
                  prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-6 
                  prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:italic 
                  prose-blockquote:text-xl prose-blockquote:text-foreground/80
                  prose-ul:my-8 prose-ul:space-y-2
                  prose-ol:my-8 prose-ol:space-y-2
                  prose-li:text-foreground/90
                  prose-hr:my-12 prose-hr:border-border
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  [&>br]:block [&>br]:my-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Citation Section */}
              {papers.length > 0 && (
                <Card className="mt-12 p-6 bg-secondary/50 border-accent/20">
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-serif font-bold text-foreground mb-2">Research Citations</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        This article is based on peer-reviewed research. Please cite the original sources when referencing this work.
                      </p>
                    </div>
                  </div>
                  
                  {papers.map((paper, index) => (
                    <div key={paper.id} className="bg-card rounded-lg p-4 border border-border mb-3 last:mb-0">
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {paper.authors}
                        {" "}({new Date(paper.publication_date).getFullYear()}). 
                        {" "}<span className="font-medium">{paper.article_title}.</span>
                        {" "}<span className="italic">{paper.journal_name}</span>
                      </p>
                      
                      {paper.doi && (
                        <a 
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          DOI: {paper.doi}
                        </a>
                      )}
                      {paper.pubmed_id && (
                        <a 
                          href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmed_id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium ml-4"
                        >
                          <ExternalLink className="h-4 w-4" />
                          PubMed: {paper.pubmed_id}
                        </a>
                      )}
                    </div>
                  ))}
                </Card>
              )}
            </div>

            {/* Related Articles CTA */}
            <div className="text-center mb-20">
              <Link to="/">
                <Button size="lg" className="bg-gradient-accent hover:opacity-90 transition-opacity">
                  Read More Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 ScienceSimplified. Making research accessible to everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArticlePage;
