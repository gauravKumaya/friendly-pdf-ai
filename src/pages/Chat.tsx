import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import ChatMessage from "@/components/ChatMessage";
import PDFSidebar from "@/components/PDFSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Menu, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm DocuMate, your AI assistant. I'm ready to help you analyze and understand your PDF documents. Ask me anything about the uploaded files!",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load files from sessionStorage
    const storedFiles = sessionStorage.getItem("uploadedFiles");
    if (storedFiles) {
      const fileData = JSON.parse(storedFiles);
      // Convert back to File objects (simplified - in real app would handle differently)
      const files = fileData.map((f: any) => new File([], f.name, { type: f.type }));
      setUploadedFiles(files);
      if (files.length > 0) {
        setActiveFile(0);
      }
      sessionStorage.removeItem("uploadedFiles");
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I've analyzed your question about "${inputValue}". Based on the PDF content, here's what I found...\n\nThis is a simulated response. In a real implementation, I would process your PDFs and provide relevant information from the documents.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (index: number) => {
    setActiveFile(index);
    toast({
      title: "PDF Selected",
      description: `Now analyzing: ${uploadedFiles[index].name}`,
    });
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFile === index) {
      setActiveFile(uploadedFiles.length > 1 ? 0 : null);
    }
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
      toast({
        title: "Files Added",
        description: `Added ${files.length} PDF${files.length > 1 ? "s" : ""}`,
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Sidebar */}
      <PDFSidebar
        files={uploadedFiles}
        activeFile={activeFile}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        onAddFiles={handleAddFiles}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border px-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hidden md:flex"
            >
              <ArrowLeft size={20} />
            </Button>
            <Logo size="sm" />
            {activeFile !== null && uploadedFiles[activeFile] && (
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {uploadedFiles[activeFile].name}
                </span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex"
          >
            <Menu size={20} />
          </Button>
        </header>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto flex gap-2">
            {uploadedFiles.length === 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddFiles}
                className="flex-shrink-0"
              >
                <Plus size={20} />
              </Button>
            )}
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                uploadedFiles.length > 0
                  ? "Ask anything about your PDFs..."
                  : "Upload PDFs to start chatting..."
              }
              disabled={isLoading || uploadedFiles.length === 0}
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || uploadedFiles.length === 0}
              size="icon"
              className="bg-primary hover:bg-primary-hover"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;