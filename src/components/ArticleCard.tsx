import { Link } from "react-router-dom";
import { Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/data/articles";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link to={`/article/${article.id}`}>
      <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-muted">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {article.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{article.readTime} min read</span>
            </div>
          </div>
          
          <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{article.journal}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-accent">
              <TrendingUp className="h-3 w-3" />
              <span className="font-semibold">IF {article.impactFactor}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ArticleCard;
