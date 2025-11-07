import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface PrecedentCaseCardProps {
  caseTitle: string;
  similarity: number;
  decision: string;
  year?: number;
  court?: string;
  citation?: string;
  onViewDetails?: () => void;
}

export const PrecedentCaseCard = ({ 
  caseTitle, 
  similarity, 
  decision, 
  year,
  court,
  citation,
  onViewDetails 
}: PrecedentCaseCardProps) => {
  const getDecisionBadgeClass = () => {
    if (decision.toLowerCase().includes("grant")) return "bg-grant text-grant-foreground";
    if (decision.toLowerCase().includes("deny")) return "bg-deny text-deny-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg flex items-start gap-2">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{caseTitle}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getDecisionBadgeClass()}>
                {decision}
              </Badge>
              {year && (
                <Badge variant="outline">
                  {year}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConfidenceMeter 
          value={Math.round(similarity * 100)} 
          label="Similarity"
          size="sm"
        />
        
        {(court || citation) && (
          <div className="space-y-1 text-sm">
            {court && (
              <p className="text-muted-foreground">
                <span className="font-medium">Court:</span> {court}
              </p>
            )}
            {citation && (
              <p className="text-muted-foreground font-mono text-xs">
                {citation}
              </p>
            )}
          </div>
        )}

        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="w-full gap-2"
          >
            View Full Case
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
