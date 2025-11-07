// src/components/FileUploadZone.tsx

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { bailAPI } from "@/lib/bailapi";

interface BailAnalysisResult {
  case_id: string;
  filename: string;
  category: string;
  recommendation: string;
  confidence: number;
  legal_provisions: any;
  accused_profile: any;
  similar_precedents: any[];
  precedent_summary: string;
  detailed_reasoning: string;
  timestamp: string;
}

interface FileUploadZoneProps {
  onUploadComplete: (result: BailAnalysisResult) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export const FileUploadZone = ({
  onUploadComplete,
  onUploadError,
  accept = ".pdf",
  maxSize = 10 * 1024 * 1024,
  disabled = false,
}: FileUploadZoneProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        let message = "File upload failed. ";

        if (rejection.errors?.[0]?.code === "file-too-large") {
          message += `File size exceeds ${maxSize / (1024 * 1024)}MB limit.`;
        } else if (rejection.errors?.[0]?.code === "file-invalid-type") {
          message += "Only PDF files are accepted.";
        } else {
          message += rejection.errors?.[0]?.message || "Please try again.";
        }

        setErrorMessage(message);
        setUploadStatus("error");
        toast.error(message);
        onUploadError?.(message);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setUploadStatus("uploading");
        setErrorMessage("");

        try {
          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            setUploadProgress(Math.floor(progress));
          }, 500);

          // ✅ Call API using service (NO hardcoding!)
          const result = await bailAPI.processBail(file);

          clearInterval(interval);
          setUploadProgress(100);
          setUploadStatus("success");
          toast.success("Bail application processed successfully!");

          // ✅ Notify parent with result
          onUploadComplete(result);
        } catch (error) {
          setUploadStatus("error");
          const errorMsg = error instanceof Error ? error.message : "Upload failed";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          onUploadError?.(errorMsg);
        }
      }
    },
    [maxSize, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [accept] },
    maxSize,
    multiple: false,
    disabled: disabled || uploadStatus === "uploading",
  });

  const resetUpload = () => {
    setUploadProgress(0);
    setUploadStatus("idle");
    setSelectedFile(null);
    setErrorMessage("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isDragActive && "border-primary bg-primary/5",
          uploadStatus === "idle" &&
            "border-muted hover:border-primary hover:bg-muted/50",
          uploadStatus === "success" && "border-green-200 bg-green-50",
          uploadStatus === "error" && "border-red-200 bg-red-50",
          (disabled || uploadStatus === "uploading") &&
            "cursor-not-allowed opacity-50"
        )}
        role="button"
        aria-label="File upload zone"
        tabIndex={0}
      >
        <input {...getInputProps()} aria-label="File input" />

        {uploadStatus === "idle" && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag & drop your bail application"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse (PDF only, max {maxSize / (1024 * 1024)}MB)
              </p>
            </div>
          </div>
        )}

        {uploadStatus === "uploading" && selectedFile && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Processing {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress
                value={uploadProgress}
                className="h-2"
                aria-label="Upload progress"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        )}

        {uploadStatus === "success" && selectedFile && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Analysis Complete
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-red-600">Analysis Failed</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {(uploadStatus === "success" || uploadStatus === "error") && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={resetUpload}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
};
