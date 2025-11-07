import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface AccusedProfileCardProps {
  age?: number;
  gender?: string;
  criminalHistory?: string;
  healthStatus?: string;
  employmentStatus?: string;
  familyTies?: string;
}

export const AccusedProfileCard = ({ 
  age,
  gender,
  criminalHistory,
  healthStatus,
  employmentStatus,
  familyTies
}: AccusedProfileCardProps) => {
  const fields = [
    { label: "Age", value: age },
    { label: "Gender", value: gender },
    { label: "Criminal History", value: criminalHistory },
    { label: "Health Status", value: healthStatus },
    { label: "Employment Status", value: employmentStatus },
    { label: "Family Ties", value: familyTies }
  ].filter(field => field.value !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Accused Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between border-b border-border pb-2 last:border-0">
              <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
              <dd className="text-sm text-foreground sm:text-right">{field.value}</dd>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No profile information available
            </p>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};
