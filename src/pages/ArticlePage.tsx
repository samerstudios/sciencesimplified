import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Calendar, User, BookOpen, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { articles } from "@/data/articles";

const ArticlePage = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);

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
            src={article.image} 
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
                  {article.category}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.date).toLocaleDateString('en-US', { 
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
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {article.subtitle}
              </p>

              {/* Article Info */}
              <div className="flex flex-wrap gap-6 py-6 mb-8 border-y border-border">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{article.author}</div>
                    <div className="text-xs text-muted-foreground">Author</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{article.journal}</div>
                    <div className="text-xs text-muted-foreground">Impact Factor: {article.impactFactor}</div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {article.content.map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed mb-6 text-base md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Citation Section */}
              <Card className="mt-12 p-6 bg-secondary/50 border-accent/20">
                <div className="flex items-start gap-3 mb-4">
                  <BookOpen className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2">Original Research Citation</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      This article is based on peer-reviewed research. Please cite the original source when referencing this work.
                    </p>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {article.citation.authors.slice(0, 3).join(", ")}
                    {article.citation.authors.length > 3 && ", et al."}
                    {" "}({article.citation.year}). 
                    {" "}<span className="font-medium">{article.citation.originalTitle}.</span>
                    {" "}<span className="italic">{article.journal}</span>
                    {article.citation.volume && `, ${article.citation.volume}`}
                    {article.citation.pages && `, ${article.citation.pages}`}.
                  </p>
                  
                  <a 
                    href={`https://doi.org/${article.citation.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    DOI: {article.citation.doi}
                  </a>
                </div>
              </Card>
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
