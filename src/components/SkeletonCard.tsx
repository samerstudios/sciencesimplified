import { Card } from "@/components/ui/card";

const SkeletonCard = () => {
  return (
    <Card className="overflow-hidden border-border bg-card h-full flex flex-col">
      <div className="aspect-video skeleton"></div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <div className="skeleton h-5 w-20 rounded-full"></div>
          <div className="skeleton h-4 w-24 rounded"></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="skeleton h-6 w-full rounded"></div>
          <div className="skeleton h-6 w-4/5 rounded"></div>
        </div>
        
        <div className="space-y-2 mb-4 flex-grow">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-3/4 rounded"></div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="skeleton h-4 w-32 rounded"></div>
        </div>
      </div>
    </Card>
  );
};

export default SkeletonCard;
