import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFilesUploaded: (files: File[]) => void;
  className?: string;
}

const FileUploadZone = ({ onFilesUploaded, className }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesUploaded(selectedFiles);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "upload-area relative overflow-hidden cursor-pointer",
          isDragging && "border-primary bg-primary/5 scale-[1.02]"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="relative z-0 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-primary/10 rounded-full">
            <Upload size={32} className="text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Drag and drop your PDFs here
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText size={16} />
            <span>PDF files only</span>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3 animate-fade-in">
          <h4 className="text-sm font-medium text-foreground">
            Selected files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto smooth-scroll">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg group hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[300px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <X size={18} className="text-destructive" />
                </button>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleUpload}
            className="w-full btn-hero"
            size="lg"
          >
            Start Chatting with {selectedFiles.length} PDF{selectedFiles.length > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;