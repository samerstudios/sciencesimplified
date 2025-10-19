import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ImpactFactorFilter from "@/components/ImpactFactorFilter";
import ArticleCard from "@/components/ArticleCard";
import { articles, categories } from "@/data/articles";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minImpactFactor, setMinImpactFactor] = useState(20);

  const filteredArticles = articles
    .filter(article => article.impactFactor >= minImpactFactor)
    .filter(article => selectedCategory === "All" || article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <ImpactFactorFilter 
            minImpactFactor={minImpactFactor}
            onChangeImpactFactor={setMinImpactFactor}
          />
          
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No articles found in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe groundbreaking scientific discoveries shouldn't be locked behind jargon and paywalls. 
              Our team of science communicators carefully selects high-impact research from journals with 
              impact factors of 20 or higher, then translates complex findings into clear, engaging narratives 
              that anyone can understand.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every article preserves the scientific integrity of the original research while making it 
              accessible, relevant, and exciting for curious minds everywhere.
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
