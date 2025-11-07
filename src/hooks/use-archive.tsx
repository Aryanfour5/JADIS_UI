// src/hooks/useArchive.ts

import { useState, useEffect } from "react";

export interface ArchivedCase {
  case_id: string;
  filename: string;
  category: string;
  recommendation: "GRANT" | "DENY" | "HUMAN_INTERVENTION_REQUIRED";
  confidence: number;
  legal_provisions: any;
  accused_profile: any;
  similar_precedents: any[];
  precedent_summary: string;
  detailed_reasoning: string;
  timestamp: string;
  savedAt: string; // When it was added to archive
}

export const useArchive = () => {
  const [archive, setArchive] = useState<ArchivedCase[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load archive from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bailArchive");
    if (stored) {
      try {
        setArchive(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load archive:", error);
      }
    }
    setLoading(false);
  }, []);

  // ✅ Save case to archive
  const saveCase = (caseData: any): ArchivedCase => {
    const archivedCase: ArchivedCase = {
      case_id: caseData.case_id,
      filename: caseData.filename,
      category: caseData.category,
      recommendation: caseData.recommendation,
      confidence: caseData.confidence,
      legal_provisions: caseData.legal_provisions,
      accused_profile: caseData.accused_profile,
      similar_precedents: caseData.similar_precedents,
      precedent_summary: caseData.precedent_summary,
      detailed_reasoning: caseData.detailed_reasoning,
      timestamp: caseData.timestamp,
      savedAt: new Date().toISOString(),
    };

    const updated = [archivedCase, ...archive];
    setArchive(updated);
    localStorage.setItem("bailArchive", JSON.stringify(updated));

    return archivedCase;
  };

  // ✅ Delete case from archive
  const deleteCase = (caseId: string) => {
    const updated = archive.filter((c) => c.case_id !== caseId);
    setArchive(updated);
    localStorage.setItem("bailArchive", JSON.stringify(updated));
  };

  // ✅ Clear all archive
  const clearArchive = () => {
    setArchive([]);
    localStorage.removeItem("bailArchive");
  };

  // ✅ Export as CSV
  const exportAsCSV = () => {
    const headers = [
      "Case ID",
      "Filename",
      "Category",
      "Recommendation",
      "Confidence",
      "Analyzed",
      "Saved"
    ];

    const rows = archive.map((c) => [
      c.case_id,
      c.filename,
      c.category,
      c.recommendation.replace(/_/g, " "),
      `${(c.confidence * 100).toFixed(1)}%`,
      new Date(c.timestamp).toLocaleString(),
      new Date(c.savedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bail-archive-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    archive,
    loading,
    saveCase,
    deleteCase,
    clearArchive,
    exportAsCSV,
  };
};
