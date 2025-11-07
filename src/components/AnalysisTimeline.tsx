import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  label: string;
  time: string;
  completed?: boolean;
}

interface AnalysisTimelineProps {
  steps: TimelineStep[];
}

export const AnalysisTimeline = ({ steps }: AnalysisTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Analysis Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-border ml-3" role="list">
          {steps.map((step, index) => (
            <li key={index} className="mb-6 ml-6 last:mb-0">
              <span 
                className={cn(
                  "absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-background",
                  step.completed ? "bg-grant" : "bg-muted"
                )}
              >
                {step.completed ? (
                  <CheckCircle className="w-3 h-3 text-grant-foreground" aria-label="Completed" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-background" aria-label="In progress" />
                )}
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-foreground">{step.label}</h3>
                <time className="text-xs text-muted-foreground">{step.time}</time>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
