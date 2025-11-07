import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { cn } from "@/lib/utils";

type Recommendation = "GRANT" | "DENY" | "HUMAN_INTERVENTION_REQUIRED";

interface RecommendationCardProps {
  recommendation: Recommendation;
  confidence: number;
  category: string;
  reasoning?: string;
}

const recommendationConfig = {
  GRANT: {
    label: "Grant Bail",
    icon: CheckCircle,
    colorClass: "border-grant bg-grant/5",
    badgeVariant: "default" as const,
    badgeClass: "bg-grant text-grant-foreground",
    iconClass: "text-grant"
  },
  DENY: {
    label: "Deny Bail",
    icon: XCircle,
    colorClass: "border-deny bg-deny/5",
    badgeVariant: "destructive" as const,
    badgeClass: "bg-deny text-deny-foreground",
    iconClass: "text-deny"
  },
  HUMAN_INTERVENTION_REQUIRED: {
    label: "Human Review Required",
    icon: AlertTriangle,
    colorClass: "border-intervention bg-intervention/5",
    badgeVariant: "default" as const,
    badgeClass: "bg-intervention text-intervention-foreground",
    iconClass: "text-intervention"
  }
};

export const RecommendationCard = ({ 
  recommendation, 
  confidence, 
  category, 
  reasoning 
}: RecommendationCardProps) => {
  const config = recommendationConfig[recommendation];
  const Icon = config.icon;

  return (
    <Card className={cn("border-2", config.colorClass)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Icon className={cn("h-8 w-8", config.iconClass)} aria-hidden="true" />
              <span>{config.label}</span>
            </CardTitle>
            <Badge className={config.badgeClass} variant={config.badgeVariant}>
              {category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConfidenceMeter value={confidence} size="lg" />
        {reasoning && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
            <p className="text-sm text-foreground">{reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
