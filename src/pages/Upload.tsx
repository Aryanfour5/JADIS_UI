// src/pages/Upload.tsx

import { useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Type definition matching backend API response
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
  similar_precedents: any[];
  precedent_summary: string;
  detailed_reasoning: string;
  timestamp: string;
}

const Upload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BailAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Handle successful file upload and analysis from FileUploadZone
   */
  const handleUploadComplete = (result: BailAnalysisResult) => {
    setAnalysisResult(result);
    setUploadedFile(null);
    setError(null);

    // Show success toast
    toast.success("Bail application analyzed successfully!");

    // Store result in session storage for Analysis page
    sessionStorage.setItem("bailAnalysisResult", JSON.stringify(result));
  };

  /**
   * Handle upload errors
   */
  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    toast.error(errorMsg);
  };

  /**
   * Navigate to analysis page with result
   */
  const handleProceedToAnalysis = () => {
    if (analysisResult) {
      navigate(`/analysis/${analysisResult.case_id}`, {
        state: { result: analysisResult },
      });
    }
  };

  /**
   * Reset and start new upload
   */
  const handleStartNewUpload = () => {
    setAnalysisResult(null);
    setError(null);
    setUploadedFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Upload Bail Application
        </h1>
        <p className="text-muted-foreground">
          Upload a PDF document for AI-powered analysis and recommendation
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          Ensure all personal identifiable information is properly redacted before upload. 
          The system will analyze the application against precedent cases and legal provisions.
        </AlertDescription>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      {!analysisResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload a bail application document in PDF format (maximum 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone 
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              accept=".pdf"
              maxSize={10 * 1024 * 1024}
              disabled={isProcessing}
            />

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Processing time varies depending on document size and complexity
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Analysis Result Section */}
      {analysisResult && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Analysis Complete</CardTitle>
            <CardDescription>
              Case ID: {analysisResult.case_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recommendation */}
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-sm text-muted-foreground">Recommendation</p>
                <p className={`text-lg font-bold mt-2 ${
                  analysisResult.recommendation === "GRANT" ? "text-green-600" :
                  analysisResult.recommendation === "DENY" ? "text-red-600" :
                  "text-amber-600"
                }`}>
                  {analysisResult.recommendation.replace(/_/g, " ")}
                </p>
              </div>

              {/* Confidence */}
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <p className="text-lg font-bold mt-2">
                  {(analysisResult.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {/* Category */}
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-sm text-muted-foreground">Bail Category</p>
                <p className="text-lg font-bold mt-2">{analysisResult.category}</p>
              </div>
            </div>

            {/* Case Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Case Details</h3>
              
              {/* Filename */}
              <div>
                <p className="text-sm text-muted-foreground">Document</p>
                <p className="text-sm font-medium">{analysisResult.filename}</p>
              </div>

              {/* Legal Provisions */}
              <div>
                <p className="text-sm text-muted-foreground">Legal Provisions</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysisResult.legal_provisions.all_sections.map((section) => (
                    <span
                      key={section}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {/* Offense Nature */}
              <div>
                <p className="text-sm text-muted-foreground">Offense Nature</p>
                <p className="text-sm font-medium capitalize">
                  {analysisResult.legal_provisions.offense_nature}
                </p>
              </div>

              {/* Accused Profile Summary */}
              <div>
                <p className="text-sm text-muted-foreground">Accused Profile</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {analysisResult.accused_profile.age && (
                    <div className="p-2 bg-muted rounded text-xs">
                      <span className="text-muted-foreground">Age:</span>
                      <p className="font-medium">{analysisResult.accused_profile.age}</p>
                    </div>
                  )}
                  <div className="p-2 bg-muted rounded text-xs">
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium capitalize">{analysisResult.accused_profile.gender}</p>
                  </div>
                  <div className="p-2 bg-muted rounded text-xs">
                    <span className="text-muted-foreground">Criminal History:</span>
                    <p className="font-medium capitalize">
                      {analysisResult.accused_profile.criminal_history.category}
                    </p>
                  </div>
                  <div className="p-2 bg-muted rounded text-xs">
                    <span className="text-muted-foreground">Dependents:</span>
                    <p className="font-medium">
                      {analysisResult.accused_profile.family_circumstances.has_dependents ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Precedent Summary */}
              {analysisResult.similar_precedents.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Similar Precedents Found</p>
                  <p className="text-sm font-medium">{analysisResult.similar_precedents.length} cases</p>
                </div>
              )}

              {/* Precedent Summary */}
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Analysis Summary</p>
                <p className="text-sm mt-2 line-clamp-3">
                  {analysisResult.precedent_summary}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleProceedToAnalysis}
                size="lg"
                className="flex-1 gap-2"
              >
                View Detailed Analysis
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                onClick={handleStartNewUpload}
                variant="outline"
                size="lg"
              >
                Upload Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Steps */}
      {!analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>How the Analysis Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
              <li>
                <span className="font-medium">Document Parsing:</span> Your PDF is analyzed to extract key information
              </li>
              <li>
                <span className="font-medium">Legal Analysis:</span> System identifies applicable statutes and legal provisions (IPC, CrPC, etc.)
              </li>
              <li>
                <span className="font-medium">Profile Extraction:</span> Accused information (age, gender, criminal history, family circumstances) is extracted
              </li>
              <li>
                <span className="font-medium">Precedent Search:</span> System searches database for similar bail cases
              </li>
              <li>
                <span className="font-medium">AI Decision:</span> Machine learning model generates recommendation (GRANT/DENY/HUMAN_INTERVENTION_REQUIRED) with confidence score
              </li>
              <li>
                <span className="font-medium">Detailed Report:</span> Complete analysis with reasoning is generated for review
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
