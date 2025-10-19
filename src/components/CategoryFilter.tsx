import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className="group"
        >
          <Badge 
            variant={selectedCategory === category ? "default" : "outline"}
            className={`
              px-6 py-2 text-sm font-medium transition-all cursor-pointer
              ${selectedCategory === category 
                ? 'bg-gradient-accent text-accent-foreground shadow-card' 
                : 'hover:bg-secondary hover:scale-105'
              }
            `}
          >
            {category}
          </Badge>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
