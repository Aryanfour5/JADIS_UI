// src/pages/Analysis.tsx

import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { RecommendationCard } from "@/components/RecommendationCard";
import { LegalProvisionsCard } from "@/components/LegalProvisionsCard";
import { AccusedProfileCard } from "@/components/AccusedProfileCard";
import { Button } from "@/components/ui/button";
import { useArchive } from "@/hooks/use-archive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Share2, 
  Save, 
  Loader2, 
  AlertCircle, 
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { DetailedReasoningCard } from "@/components/DetailedReasoningCard";

/**
 * Type matching backend API response
 */
interface BailAnalysisResult {
  case_id: string;
  filename: string;
  category: string;
  recommendation: "GRANT" | "DENY" | "HUMAN_INTERVENTION_REQUIRED";
  confidence: number;
  legal_provisions: {
    provisions: {
      IPC: string[];
      CrPC: string[];
      NDPS: string[];
      POCSO: string[];
      UAPA: string[];
      SC_ST_ACT: string[];
      other: string[];
    };
    all_sections: string[];
    primary_statute: string;
    offense_nature: string;
  };
  accused_profile: {
    age: number | null;
    age_group: string;
    gender: string;
    custody_duration: string | null;
    custody_days: number | null;
    health_status: {
      has_health_issues: boolean;
      medical_bail_eligible: boolean;
      conditions: string[];
    };
    criminal_history: {
      category: string;
      previous_cases: number | null;
      repeat_offender: boolean;
      first_time_accused: boolean;
    };
    socioeconomic_status: string;
    region: string | null;
    employment_status: string | null;
    family_circumstances: {
      has_dependents: boolean;
      sole_breadwinner: boolean;
      pregnant: boolean;
      elderly_parents: boolean;
      minor_children: boolean;
    };
  };
  similar_precedents: Array<{
    case_title?: string;
    decision?: string;
    similarity_score?: number;
  }>;
  precedent_summary: string;
  detailed_reasoning: string;
  timestamp: string;
}

const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<BailAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const { saveCase } = useArchive();

  /**
   * Load analysis data from location state or session storage
   */
  useEffect(() => {
    try {
      if (location.state?.result) {
        setAnalysisData(location.state.result);
        setLoading(false);
        return;
      }

      const savedResult = sessionStorage.getItem("bailAnalysisResult");
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult);
        setAnalysisData(parsedResult);
        setLoading(false);
        return;
      }

      setError("No analysis data found. Please upload a bail application first.");
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analysis data"
      );
      setLoading(false);
    }
  }, [id, location.state]);

  /**
   * Save analysis to archive
   */
  const handleSave = () => {
    if (!analysisData) return;

    try {
      saveCase(analysisData);
      toast.success("✓ Analysis saved to archive");
    } catch (err) {
      toast.error("Failed to save analysis");
    }
  };

  /**
   * ✅ Format reasoning text with color-coded sections
   */
  const formatReasoningForHTML = (text: string): string => {
    const sections = text.split(/\n(?=\*\*\d+\.)/);
    
    return sections
      .map((section) => {
        const titleMatch = section.match(/\*\*(.+?):\*\*/);
        const title = titleMatch ? titleMatch[1] : "";
        const content = section.replace(/\*\*(.+?):\*\*/, "").trim();

        // Determine section type and styling
        let sectionClass = "reasoning-section";
        let sectionEmoji = "📖";

        if (title.includes("Summary")) {
          sectionClass += " summary";
          sectionEmoji = "📖";
        } else if (title.includes("Legal Framework")) {
          sectionClass += " framework";
          sectionEmoji = "⚖️";
        } else if (title.includes("Precedent")) {
          sectionClass += " precedent";
          sectionEmoji = "📚";
        } else if (title.includes("Favoring")) {
          sectionClass += " favoring";
          sectionEmoji = "✅";
        } else if (title.includes("Against")) {
          sectionClass += " against";
          sectionEmoji = "❌";
        } else if (title.includes("Reasoning") || title.includes("Conclusion")) {
          sectionClass += " reasoning";
          sectionEmoji = "🎯";
        }

        // Format content with bold text and bullets
        let formattedContent = content
          .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
          .split("\n")
          .map((line) => {
            if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
              const bulletText = line.replace(/^[\s\*\-]+/, "").trim();
              return `<li>${bulletText}</li>`;
            }
            return line;
          })
          .join("\n");

        // Wrap bullets in ul
        if (formattedContent.includes("<li>")) {
          formattedContent = `<ul>${formattedContent}</ul>`;
        }

        return `
          <div class="${sectionClass}">
            <div class="reasoning-title">${sectionEmoji} ${title}</div>
            <div class="reasoning-content">${formattedContent}</div>
          </div>
        `;
      })
      .join("");
  };

  /**
   * Generate professional HTML report with formatted reasoning
   */
  const generateReportHTML = (data: BailAnalysisResult): string => {
    const recommendationColor = {
      GRANT: "#10b981",
      DENY: "#ef4444",
      HUMAN_INTERVENTION_REQUIRED: "#f59e0b"
    }[data.recommendation];

    const recommendationBgColor = {
      GRANT: "#ecfdf5",
      DENY: "#fef2f2",
      HUMAN_INTERVENTION_REQUIRED: "#fffbf0"
    }[data.recommendation];

    const formattedReasoning = formatReasoningForHTML(data.detailed_reasoning);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bail Analysis Report - ${data.case_id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1f2937;
          line-height: 1.6;
          background: #f9fafb;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .header {
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 30px;
          margin-bottom: 40px;
          text-align: center;
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 10px;
        }
        
        .report-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
        }
        
        .meta-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 30px;
          font-size: 13px;
        }
        
        .meta-item {
          text-align: center;
        }
        
        .meta-label {
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .meta-value {
          color: #111827;
          font-weight: 600;
          font-size: 14px;
        }
        
        .recommendation-card {
          background: ${recommendationBgColor};
          border: 2px solid ${recommendationColor};
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .recommendation-label {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        
        .recommendation-text {
          color: ${recommendationColor};
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          text-transform: capitalize;
        }
        
        .confidence-bar {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          max-width: 300px;
          margin: 15px auto;
        }
        
        .confidence-fill {
          background: ${recommendationColor};
          height: 100%;
          width: ${Math.round(data.confidence * 100)}%;
        }
        
        .confidence-text {
          color: #6b7280;
          font-size: 13px;
          margin-top: 8px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e3a8a;
          border-left: 4px solid #1e3a8a;
          padding-left: 15px;
          margin-bottom: 20px;
        }
        
        .section-content {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-item {
          padding: 15px;
          background: white;
          border-radius: 6px;
          border-left: 3px solid #1e3a8a;
        }
        
        .info-label {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
          font-weight: 600;
        }
        
        .info-value {
          color: #111827;
          font-size: 14px;
          font-weight: 500;
        }
        
        .tag {
          display: inline-block;
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
          margin-bottom: 8px;
        }
        
        .reasoning-section {
          background: #f9fafb;
          border-left: 4px solid #1e3a8a;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .reasoning-section.summary {
          background: #eff6ff;
          border-left-color: #3b82f6;
        }
        
        .reasoning-section.framework {
          background: #f0f4ff;
          border-left-color: #4f46e5;
        }
        
        .reasoning-section.precedent {
          background: #fffbf0;
          border-left-color: #f59e0b;
        }
        
        .reasoning-section.favoring {
          background: #f0fdf4;
          border-left-color: #10b981;
        }
        
        .reasoning-section.against {
          background: #fef2f2;
          border-left-color: #ef4444;
        }
        
        .reasoning-section.reasoning {
          background: #faf5ff;
          border-left-color: #a855f7;
        }
        
        .reasoning-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #1f2937;
        }
        
        .reasoning-content {
          color: #374151;
          line-height: 1.8;
        }
        
        .reasoning-content ul {
          margin-left: 20px;
          margin-top: 10px;
        }
        
        .reasoning-content li {
          margin-bottom: 10px;
          list-style-type: disc;
        }
        
        .reasoning-content strong {
          font-weight: 600;
          color: #111827;
        }
        
        .reasoning-intro {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          color: #374151;
        }
        
        .reasoning-disclaimer {
          background: #fffbf0;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
          color: #374151;
          font-size: 13px;
        }
        
        .precedent-section {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
          margin-bottom: 15px;
        }
        
        .precedent-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .precedent-info {
          font-size: 13px;
          color: #6b7280;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .timestamp {
          color: #9ca3af;
          font-size: 12px;
          margin-top: 10px;
        }
        
        @media print {
          body {
            background: white;
          }
          .container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚖️ HybridBail</div>
          <div class="report-title">Bail Analysis Report</div>
        </div>

        <div class="meta-info">
          <div class="meta-item">
            <div class="meta-label">Case ID</div>
            <div class="meta-value">${data.case_id}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Document</div>
            <div class="meta-value">${data.filename}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Generated</div>
            <div class="meta-value">${new Date(data.timestamp).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="recommendation-card">
          <div class="recommendation-label">System Recommendation</div>
          <div class="recommendation-text">${data.recommendation.replace(/_/g, " ")}</div>
          <div class="confidence-bar">
            <div class="confidence-fill"></div>
          </div>
          <div class="confidence-text">Confidence: ${(data.confidence * 100).toFixed(1)}%</div>
        </div>

        <div class="section">
          <div class="section-title">📋 Case Information</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Bail Category</div>
                <div class="info-value">${data.category}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Offense Nature</div>
                <div class="info-value">${data.legal_provisions.offense_nature}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">⚖️ Legal Provisions</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Primary Statute</div>
                <div class="info-value">${data.legal_provisions.primary_statute}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Applicable Sections</div>
                <div class="info-value">${data.legal_provisions.all_sections.join(", ")}</div>
              </div>
            </div>
            ${data.legal_provisions.provisions.IPC.length > 0 ? `
              <div style="margin-top: 15px;">
                <div class="info-label">IPC Sections</div>
                <div>${data.legal_provisions.provisions.IPC.map(s => `<span class="tag">IPC ${s}</span>`).join("")}</div>
              </div>
            ` : ""}
          </div>
        </div>

        <div class="section">
          <div class="section-title">👤 Accused Profile</div>
          <div class="section-content">
            <div class="info-grid">
              ${data.accused_profile.age ? `
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${data.accused_profile.age} years (${data.accused_profile.age_group})</div>
              </div>
              ` : ""}
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${data.accused_profile.gender}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Criminal History</div>
                <div class="info-value">${data.accused_profile.criminal_history.category}</div>
              </div>
              ${data.accused_profile.employment_status ? `
              <div class="info-item">
                <div class="info-label">Employment Status</div>
                <div class="info-value">${data.accused_profile.employment_status}</div>
              </div>
              ` : ""}
              <div class="info-item">
                <div class="info-label">Health Status</div>
                <div class="info-value">${data.accused_profile.health_status.has_health_issues ? "Yes" : "No"} Health Issues</div>
              </div>
              <div class="info-item">
                <div class="info-label">Family Status</div>
                <div class="info-value">${data.accused_profile.family_circumstances.has_dependents ? "Has Dependents" : "No Dependents"}</div>
              </div>
            </div>
          </div>
        </div>

        ${data.similar_precedents.length > 0 ? `
        <div class="section">
          <div class="section-title">📚 Similar Precedent Cases (${data.similar_precedents.length})</div>
          <div class="section-content">
            ${data.similar_precedents.map((p, idx) => `
              <div class="precedent-section">
                <div class="precedent-title">${idx + 1}. ${p.case_title || `Precedent Case`}</div>
                <div class="precedent-info">
                  <strong>Decision:</strong> ${p.decision || "N/A"} | 
                  <strong>Similarity:</strong> ${((p.similarity_score || 0) * 100).toFixed(0)}%
                </div>
              </div>
            `).join("")}
          </div>
        </div>
        ` : ""}

        <div class="section">
          <div class="section-title">📊 Precedent Analysis Summary</div>
          <div class="section-content">
            <p>${data.precedent_summary}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📝 Detailed Legal Analysis & Reasoning</div>
          <div class="reasoning-intro">
            <p>The following is a comprehensive legal analysis based on the bail application, applicable legal provisions, and the system's algorithmic assessment of relevant factors.</p>
          </div>
          ${formattedReasoning}
          <div class="reasoning-disclaimer">
            <strong>⚖️ Legal Disclaimer:</strong> This analysis is generated by an AI system and is intended for informational purposes only. It should not be considered as legal advice.
          </div>
        </div>

        <div class="footer">
          <p>This report was generated by HybridBail - AI-Powered Bail Decision Support System</p>
          <p class="timestamp">Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  /**
   * Download report as HTML file
   */
  const downloadReport = (htmlContent: string, caseId: string) => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bail-analysis-report-${caseId}-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  /**
   * Generate detailed report
   */
  const generateDetailedReport = () => {
    if (!analysisData) return;

    setIsGeneratingReport(true);

    setTimeout(() => {
      const htmlContent = generateReportHTML(analysisData);
      downloadReport(htmlContent, analysisData.case_id);
      setIsGeneratingReport(false);
      toast.success("Detailed report generated and downloaded!");
    }, 1500);
  };

  /**
   * Export analysis to PDF (using print dialog)
   */
  const handleExportPDF = () => {
    if (!analysisData) return;
    toast.info("Opening print dialog...");
    window.print();
  };

  /**
   * Share case link
   */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !analysisData) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error || "No analysis data available"}
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analysis Results
          </h1>
          <p className="text-muted-foreground font-mono">{analysisData.case_id}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(analysisData.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={generateDetailedReport}
            disabled={isGeneratingReport}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" aria-hidden="true" />
                Generate Report
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </Button>
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save
          </Button>
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </div>

      <RecommendationCard
        recommendation={analysisData.recommendation}
        confidence={analysisData.confidence}
        category={analysisData.category}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <LegalProvisionsCard
          provisions={analysisData.legal_provisions.all_sections}
          primaryStatute={analysisData.legal_provisions.primary_statute}
          offenseNature={analysisData.legal_provisions.offense_nature}
        />

        <AccusedProfileCard
          age={analysisData.accused_profile.age}
          gender={analysisData.accused_profile.gender}
          criminalHistory={analysisData.accused_profile.criminal_history.category}
          healthStatus={
            analysisData.accused_profile.health_status.has_health_issues
              ? "Yes - Medical bail eligible"
              : "No significant issues"
          }
          employmentStatus={
            analysisData.accused_profile.employment_status || "Not specified"
          }
          familyTies={
            analysisData.accused_profile.family_circumstances.has_dependents
              ? "Has dependents"
              : "No dependents"
          }
        />
      </div>

      {analysisData.similar_precedents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Precedent Cases ({analysisData.similar_precedents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData.similar_precedents.map((precedent, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {precedent.case_title || `Precedent Case ${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Decision: {precedent.decision || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {((precedent.similarity_score || 0) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Similarity</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Precedent Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysisData.precedent_summary}
          </p>
        </CardContent>
      </Card>

      <DetailedReasoningCard 
        reasoning={analysisData.detailed_reasoning}
        recommendation={analysisData.recommendation}
      />

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Document Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <span className="font-medium text-foreground">File:</span> {analysisData.filename}
          </p>
          <p>
            <span className="font-medium text-foreground">Analyzed:</span>{" "}
            {new Date(analysisData.timestamp).toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-foreground">Case ID:</span>{" "}
            {analysisData.case_id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analysis;
