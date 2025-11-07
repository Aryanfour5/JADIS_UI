import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ConfidenceMeter = ({ 
  value, 
  label = "Confidence", 
  showPercentage = true,
  size = "md" 
}: ConfidenceMeterProps) => {
  const getColorClass = () => {
    if (value >= 80) return "bg-grant";
    if (value >= 60) return "bg-intervention";
    return "bg-deny";
  };

  const getTextColorClass = () => {
    if (value >= 80) return "text-grant";
    if (value >= 60) return "text-intervention";
    return "text-deny";
  };

  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }[size];

  const textSizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }[size];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn("font-medium text-muted-foreground", textSizeClass)}>
          {label}
        </span>
        {showPercentage && (
          <span 
            className={cn("font-bold", textSizeClass, getTextColorClass())}
            aria-label={`${label}: ${value} percent`}
          >
            {value}%
          </span>
        )}
      </div>
      <Progress 
        value={value} 
        className={cn(heightClass, "w-full")}
        indicatorClassName={getColorClass()}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} meter`}
      />
    </div>
  );
};
