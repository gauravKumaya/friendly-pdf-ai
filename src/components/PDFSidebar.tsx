import { FileText, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PDFFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface PDFSidebarProps {
  files: PDFFile[];
  activeFile: number | null;
  onFileSelect: (index: number) => void;
  onFileRemove: (index: number) => void;
  onAddFiles: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const PDFSidebar = ({
  files,
  activeFile,
  onFileSelect,
  onFileRemove,
  onAddFiles,
  isOpen,
}: PDFSidebarProps) => {
  return (
    <div
      className={cn(
        "h-full bg-card border-r border-border transition-all duration-300",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground">PDF Files</h3>
          <Button
            onClick={onAddFiles}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-2 space-y-1">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              onClick={() => onFileSelect(index)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                activeFile === index
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText
                  size={16}
                  className={cn(
                    activeFile === index ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm truncate",
                    activeFile === index ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {file.name}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(index);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              >
                <X size={14} className="text-destructive" />
              </button>
            </div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-8 px-4">
            <FileText size={32} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No PDFs uploaded yet
            </p>
            <Button
              onClick={onAddFiles}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Plus size={14} className="mr-1" />
              Add PDF
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default PDFSidebar;