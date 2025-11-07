import { useState } from "react";
import { PrecedentCaseCard } from "@/components/PrecedentCaseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const mockPrecedents = [
  {
    caseTitle: "State vs. Ramesh Kumar (2023)",
    similarity: 0.89,
    decision: "Bail Granted",
    year: 2023,
    court: "Delhi High Court",
    citation: "2023 DLT 456"
  },
  {
    caseTitle: "Priya Sharma vs. State (2022)",
    similarity: 0.82,
    decision: "Bail Granted",
    year: 2022,
    court: "Supreme Court",
    citation: "2022 SCC 123"
  },
  {
    caseTitle: "State vs. Vijay Singh (2024)",
    similarity: 0.78,
    decision: "Bail Granted",
    year: 2024,
    court: "Mumbai High Court",
    citation: "2024 BLR 789"
  },
  {
    caseTitle: "Amit Verma vs. State (2023)",
    similarity: 0.75,
    decision: "Bail Denied",
    year: 2023,
    court: "Calcutta High Court",
    citation: "2023 CLT 234"
  },
  {
    caseTitle: "State vs. Neha Gupta (2024)",
    similarity: 0.71,
    decision: "Bail Granted",
    year: 2024,
    court: "Karnataka High Court",
    citation: "2024 KLR 567"
  },
  {
    caseTitle: "Rajesh Patel vs. State (2022)",
    similarity: 0.68,
    decision: "Bail Denied",
    year: 2022,
    court: "Gujarat High Court",
    citation: "2022 GLR 890"
  }
];

const Precedents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("similarity");

  const handleViewDetails = (caseTitle: string) => {
    toast.info(`Viewing details for: ${caseTitle}`);
  };

  const filteredPrecedents = mockPrecedents
    .filter(p => {
      const matchesSearch = p.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.citation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDecision = decisionFilter === "all" || 
                             p.decision.toLowerCase().includes(decisionFilter.toLowerCase());
      return matchesSearch && matchesDecision;
    })
    .sort((a, b) => {
      if (sortBy === "similarity") return b.similarity - a.similarity;
      if (sortBy === "year") return b.year - a.year;
      return 0;
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Precedent Cases</h1>
        <p className="text-muted-foreground">
          Browse and search through similar precedent cases from the database
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by case title or citation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search precedent cases"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Filter by decision">
                <SelectValue placeholder="All Decisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="grant">Granted</SelectItem>
                <SelectItem value="deni">Denied</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" aria-label="Sort by">
                <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="similarity">Similarity</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredPrecedents.length} case{filteredPrecedents.length !== 1 ? 's' : ''}
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrecedents.map((precedent, index) => (
            <PrecedentCaseCard
              key={index}
              {...precedent}
              onViewDetails={() => handleViewDetails(precedent.caseTitle)}
            />
          ))}
        </div>
      </div>

      {filteredPrecedents.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No precedent cases match your search criteria</p>
        </Card>
      )}
    </div>
  );
};

export default Precedents;
