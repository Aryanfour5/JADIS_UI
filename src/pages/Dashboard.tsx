import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, TrendingUp, CheckCircle, Upload, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const mockCases = [
  {
    id: "BAIL-2025-001",
    category: "Bailable Offense",
    recommendation: "GRANT",
    confidence: 87,
    date: "2025-01-15",
    status: "Completed"
  },
  {
    id: "BAIL-2025-002",
    category: "Non-Bailable Offense",
    recommendation: "DENY",
    confidence: 92,
    date: "2025-01-14",
    status: "Completed"
  },
  {
    id: "BAIL-2025-003",
    category: "Complex Case",
    recommendation: "HUMAN_INTERVENTION_REQUIRED",
    confidence: 65,
    date: "2025-01-14",
    status: "Review Pending"
  }
];

const getRecommendationBadge = (rec: string) => {
  if (rec === "GRANT") return "bg-grant text-grant-foreground";
  if (rec === "DENY") return "bg-deny text-deny-foreground";
  return "bg-intervention text-intervention-foreground";
};

const getRecommendationLabel = (rec: string) => {
  if (rec === "GRANT") return "Grant";
  if (rec === "DENY") return "Deny";
  return "Review Required";
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">AI-powered bail decision support system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Cases"
          value="248"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Pending Review"
          value="12"
          icon={Clock}
          trend={{ value: 3, isPositive: false }}
        />
        <KPICard
          title="Processed Today"
          value="8"
          icon={TrendingUp}
          trend={{ value: 25, isPositive: true }}
        />
        <KPICard
          title="Avg Confidence"
          value="84%"
          icon={CheckCircle}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild size="lg" className="gap-2">
          <Link to="/upload">
            <Upload className="h-5 w-5" aria-hidden="true" />
            New Application
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link to="/archive">
            <Download className="h-5 w-5" aria-hidden="true" />
            View Reports
          </Link>
        </Button>
      </div>

      {/* Recent Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-sm text-muted-foreground" scope="col">
                    Case ID
                  </th>
                  <th className="pb-3 font-medium text-sm text-muted-foreground" scope="col">
                    Category
                  </th>
                  <th className="pb-3 font-medium text-sm text-muted-foreground" scope="col">
                    Recommendation
                  </th>
                  <th className="pb-3 font-medium text-sm text-muted-foreground text-center" scope="col">
                    Confidence
                  </th>
                  <th className="pb-3 font-medium text-sm text-muted-foreground" scope="col">
                    Date
                  </th>
                  <th className="pb-3 font-medium text-sm text-muted-foreground" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCases.map((caseItem) => (
                  <tr 
                    key={caseItem.id} 
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {caseItem.id}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-muted-foreground">
                        {caseItem.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge className={cn("text-xs", getRecommendationBadge(caseItem.recommendation))}>
                        {getRecommendationLabel(caseItem.recommendation)}
                      </Badge>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "text-sm font-medium",
                        caseItem.confidence >= 80 ? "text-grant" :
                        caseItem.confidence >= 60 ? "text-intervention" :
                        "text-deny"
                      )}>
                        {caseItem.confidence}%
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-muted-foreground">
                        {caseItem.date}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary"
                      >
                        <Link to={`/analysis/${caseItem.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
