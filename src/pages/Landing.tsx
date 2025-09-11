import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import FileUploadZone from "@/components/FileUploadZone";
import { Sparkles, Zap, Shield } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesUploaded = (files: File[]) => {
    setIsUploading(true);
    // Store files in sessionStorage for the chat page
    const fileData = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    sessionStorage.setItem("uploadedFiles", JSON.stringify(fileData));
    
    setTimeout(() => {
      navigate("/chat");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <Logo size="lg" />
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your AI-powered PDF assistant
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your PDFs and start an intelligent conversation with your documents. 
              Extract insights, ask questions, and get summaries instantly.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI understands context and provides accurate answers
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Zap className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant responses and navigate through documents quickly
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed securely and remain private
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <FileUploadZone onFilesUploaded={handleFilesUploaded} />
          </div>

          {isUploading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Processing your PDFs...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Landing;