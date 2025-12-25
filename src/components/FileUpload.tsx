import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  isProcessing: boolean;
}

const FileUpload = ({ onFileContent, isProcessing }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    // Check file type
    const validTypes = [
      "text/plain",
      "text/csv",
      "application/json",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    const isValidType = validTypes.includes(selectedFile.type) || 
      selectedFile.name.endsWith('.txt') ||
      selectedFile.name.endsWith('.csv');

    if (!isValidType) {
      setError("Please upload a text, CSV, image, or PDF file");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);

    try {
      let content = "";

      if (selectedFile.type.startsWith("image/")) {
        // For images, we'll convert to base64 and describe what we can see
        const base64 = await fileToBase64(selectedFile);
        content = `[Image file: ${selectedFile.name}]\n\nThis is an image file. Please analyze the image for product quotation information.\n\nBase64 data: ${base64}`;
      } else if (selectedFile.type === "application/pdf") {
        // For PDFs, we'll note it's a PDF and ask AI to parse
        const base64 = await fileToBase64(selectedFile);
        content = `[PDF file: ${selectedFile.name}]\n\nThis is a PDF quotation document. Please extract all product names, specifications, prices, and vendor information.\n\nBase64 data: ${base64}`;
      } else {
        // For text files, read directly
        content = await selectedFile.text();
      }

      onFileContent(content, selectedFile.name);
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read file");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.csv,.json,.pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
        id="quotation-upload"
        disabled={isProcessing}
      />

      {!file ? (
        <label
          htmlFor="quotation-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isProcessing
              ? "border-muted bg-muted/30 cursor-not-allowed"
              : "border-border hover:border-primary hover:bg-primary/5"
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Upload Quotation</span>
            <span className="text-xs">PDF, Image, or Text file (max 5MB)</span>
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FileUpload;
