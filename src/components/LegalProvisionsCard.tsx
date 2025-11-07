import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy } from "lucide-react";
import { toast } from "sonner";

interface LegalProvisionsCardProps {
  provisions: string[];
  primaryStatute?: string;
  offenseNature?: string;
}

export const LegalProvisionsCard = ({ 
  provisions, 
  primaryStatute,
  offenseNature 
}: LegalProvisionsCardProps) => {
  const copyProvisions = () => {
    const text = provisions.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Provisions copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Legal Provisions</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyProvisions}
            className="gap-2"
            aria-label="Copy provisions to clipboard"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {primaryStatute && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Primary Statute</p>
            <Badge variant="secondary" className="font-mono text-xs">
              {primaryStatute}
            </Badge>
          </div>
        )}
        
        {offenseNature && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Offense Nature</p>
            <p className="text-sm text-foreground">{offenseNature}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Applicable Provisions</p>
          <ul className="space-y-2" role="list">
            {provisions.map((provision, index) => (
              <li 
                key={index} 
                className="text-sm font-mono bg-muted p-3 rounded-md border border-border"
              >
                {provision}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
