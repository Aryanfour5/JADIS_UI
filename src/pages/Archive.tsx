// src/pages/Archive.tsx

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  FileText,
  Trash2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useArchive } from "@/hooks/use-archive";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getRecommendationBadge = (rec: string) => {
  if (rec === "GRANT")
    return "bg-green-100 text-green-700 border-green-300";
  if (rec === "DENY") return "bg-red-100 text-red-700 border-red-300";
  return "bg-amber-100 text-amber-700 border-amber-300";
};

const getRecommendationLabel = (rec: string) => {
  if (rec === "GRANT") return "Grant";
  if (rec === "DENY") return "Deny";
  return "Review Required";
};

const Archive = () => {
  const { archive, loading, deleteCase, clearArchive, exportAsCSV } =
    useArchive();
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<string>(
    "all"
  );

  // ✅ Filter archive based on search and recommendation
  const filteredCases = useMemo(() => {
    return archive.filter((c) => {
      const matchesSearch =
        c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRecommendation =
        recommendationFilter === "all" || c.recommendation === recommendationFilter;

      return matchesSearch && matchesRecommendation;
    });
  }, [archive, searchQuery, recommendationFilter]);

  /**
   * Handle export CSV
   */
  const handleExportCSV = () => {
    if (archive.length === 0) {
      toast.error("No cases to export");
      return;
    }
    exportAsCSV();
    toast.success("CSV exported successfully");
  };

  /**
   * Handle delete case
   */
  const handleDeleteCase = (caseId: string) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      deleteCase(caseId);
      toast.success("Case deleted");
    }
  };

  /**
   * Handle clear all
   */
  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all archived cases? This cannot be undone."
      )
    ) {
      clearArchive();
      toast.success("Archive cleared");
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading archive...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Case Archive
          </h1>
          <p className="text-muted-foreground">
            Search and review all analyzed bail applications ({archive.length}{" "}
            saved)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            disabled={archive.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
          {archive.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="gap-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cases are saved locally in your browser. They will be deleted if you
          clear your browser cache.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case ID, filename, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search cases"
              />
            </div>

            <Select
              value={recommendationFilter}
              onValueChange={setRecommendationFilter}
            >
              <SelectTrigger
                className="w-[220px]"
                aria-label="Filter by recommendation"
              >
                <SelectValue placeholder="All Recommendations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                <SelectItem value="GRANT">Granted</SelectItem>
                <SelectItem value="DENY">Denied</SelectItem>
                <SelectItem value="HUMAN_INTERVENTION_REQUIRED">
                  Review Required
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {archive.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No cases in archive yet
          </p>
          <p className="text-sm text-muted-foreground">
            Upload and analyze a bail application, then click "Save" to add it
            to your archive.
          </p>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredCases.length} case
              {filteredCases.length !== 1 ? "s" : ""}
            </p>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full" role="table">
                    <thead>
                      <tr className="border-b border-border text-left bg-muted/50">
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Case ID
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Filename
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Category
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Recommendation
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground text-center"
                          scope="col"
                        >
                          Confidence
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Saved
                        </th>
                        <th
                          className="p-4 font-medium text-sm text-muted-foreground"
                          scope="col"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((caseItem) => (
                        <tr
                          key={caseItem.case_id}
                          className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium text-foreground">
                                {caseItem.case_id}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground truncate max-w-xs">
                              {caseItem.filename}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">
                              {caseItem.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={cn(
                                "text-xs",
                                getRecommendationBadge(caseItem.recommendation)
                              )}
                            >
                              {getRecommendationLabel(caseItem.recommendation)}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                caseItem.confidence >= 0.8
                                  ? "text-green-600"
                                  : caseItem.confidence >= 0.6
                                  ? "text-amber-600"
                                  : "text-red-600"
                              )}
                            >
                              {(caseItem.confidence * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(caseItem.savedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4 space-x-2">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary"
                            >
                              <Link to={`/analysis/${caseItem.case_id}`}>
                                View
                              </Link>
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeleteCase(caseItem.case_id)
                              }
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* No Results */}
            {filteredCases.length === 0 && (
              <Card className="p-12 text-center mt-4">
                <p className="text-muted-foreground">
                  No cases match your search criteria
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Archive;
