import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ArticleCard from "@/components/ArticleCard";
import SkeletonCard from "@/components/SkeletonCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const articlesRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-fade-in-up')) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in-up');
              entry.target.classList.remove('opacity-0');
              observer.unobserve(entry.target); // Stop observing once animated
            }, index * 100);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const cards = articlesRef.current?.querySelectorAll('.article-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [articles, selectedCategory, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: subjects } = await supabase.from("subjects").select("id, name");
        if (subjects) {
          setCategories(["All", ...subjects.map(s => s.name)]);
        }

        const { data: posts } = await supabase
          .from("blog_posts")
          .select(`
            *,
            subjects:subject_id (
              name
            )
          `)
          .eq("status", "published")
          .order("publish_date", { ascending: false });

        if (posts) {
          const formattedArticles = posts.map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            image: post.hero_image_url || "/quantum.jpg",
            date: new Date(post.publish_date || post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            readTime: post.read_time,
            category: (post.subjects as any)?.name || "Physics",
          }));
          setArticles(formattedArticles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles = articles.filter(
    article => selectedCategory === "All" || article.category === selectedCategory
  );

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to articles section
    document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section id="articles" className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            
            {!loading && filteredArticles.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-muted-foreground whitespace-nowrap">
                  Articles per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
                >
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>
              </div>
            )}
          </div>
          
          {loading ? (
            <div ref={articlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div ref={articlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedArticles.map((article) => (
                  <div key={article.id} className="article-card opacity-0">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No articles found. Check back soon!
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {filteredArticles.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-md border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-md border transition-colors ${
                                currentPage === page
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border bg-background hover:bg-accent'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-md border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="newsletter" className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 animate-fade-in">
        <div className="container mx-auto px-6 lg:px-12">
          <NewsletterSignup />
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 bg-secondary/30 animate-fade-in">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Mission Statement
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Breakthrough science shouldn't be trapped behind jargon or paywalls. I, Samer Mathkour, a PhD candidate, 
              use advanced AI to distill top-tier, peer-reviewed research into crisp, compelling reads anyone can understand, 
              without sacrificing clarity or scientific integrity.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every week, I scan leading scientific journals and identify the most impactful recent paper in each major field. 
              The system weighs journal reputation, scientific significance, and public interest to surface discoveries that matter, 
              then transforms each study into an engaging, plain-English narrative at a high school reading level, with clear 
              explanations, key findings, and proper citations to the original research.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Transparency Note:</strong> All article selections and summaries are AI-generated and presented for 
              informational purposes only. They are not medical or professional advice. Each post links to the original 
              peer-reviewed paper so readers can explore the full research.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 ScienceSimplified. Making research accessible to everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
