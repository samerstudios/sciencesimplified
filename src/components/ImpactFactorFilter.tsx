import { Slider } from "@/components/ui/slider";
import { TrendingUp } from "lucide-react";

interface ImpactFactorFilterProps {
  minImpactFactor: number;
  onChangeImpactFactor: (value: number) => void;
}

const ImpactFactorFilter = ({ minImpactFactor, onChangeImpactFactor }: ImpactFactorFilterProps) => {
  return (
    <div className="max-w-md mx-auto mb-12 bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-accent rounded">
          <TrendingUp className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Impact Factor Filter</h3>
          <p className="text-xs text-muted-foreground">Show articles with IF ≥ {minImpactFactor}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Slider
          value={[minImpactFactor]}
          onValueChange={(values) => onChangeImpactFactor(values[0])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium text-accent">{minImpactFactor}</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactFactorFilter;
