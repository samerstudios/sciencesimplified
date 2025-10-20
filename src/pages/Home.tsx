import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ArticleCard from "@/components/ArticleCard";
import SkeletonCard from "@/components/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const articlesRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in-up');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = articlesRef.current?.querySelectorAll('.article-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [articles, selectedCategory]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section id="articles" className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          {loading ? (
            <div ref={articlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div ref={articlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
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
            </>
          )}
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
            <p>© 2024 ScienceSimplified. Making research accessible to everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
