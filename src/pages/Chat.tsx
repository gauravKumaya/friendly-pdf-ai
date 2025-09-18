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
import { queryPDF, uploadPDF } from "@/services/api";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatSession {
  fileId: string;
  messages: Message[];
}

interface PDFFile {
  id: string; // This is the pdf_id from backend
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Store chat sessions for each PDF using pdf_id as key
  const [chatSessions, setChatSessions] = useState<Map<string, Message[]>>(new Map());
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [activeFile, setActiveFile] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper to get current file's messages
  const getCurrentMessages = (): Message[] => {
    if (activeFile === null || !uploadedFiles[activeFile]) return [];
    const fileId = uploadedFiles[activeFile].id; // Use pdf_id instead of name
    return chatSessions.get(fileId) || [];
  };

  useEffect(() => {
    // Load files from sessionStorage
    const storedFiles = sessionStorage.getItem("uploadedFiles");
    if (storedFiles) {
      const fileData: PDFFile[] = JSON.parse(storedFiles);
      setUploadedFiles(fileData);
      if (fileData.length > 0) {
        setActiveFile(0);
        // Initialize first file's chat session
        const fileId = fileData[0].id;
        const fileName = fileData[0].name;
        setChatSessions((prev) => {
          const newSessions = new Map(prev);
          if (!newSessions.has(fileId)) {
            newSessions.set(fileId, [{
              id: `welcome-${fileId}`,
              content: `Hello! I'm ready to help you analyze "${fileName}". Ask me anything about this specific PDF document!`,
              role: "assistant" as const,
              timestamp: new Date(),
            }]);
          }
          return newSessions;
        });
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
  }, [chatSessions, activeFile]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || activeFile === null) return;
    
    const pdfId = uploadedFiles[activeFile].id;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    // Add message to current file's chat session
    setChatSessions((prev) => {
      const newSessions = new Map(prev);
      const currentMessages = newSessions.get(pdfId) || [];
      newSessions.set(pdfId, [...currentMessages, userMessage]);
      return newSessions;
    });
    
    setInputValue("");
    setIsLoading(true);

    try {
      // Call the backend API with the pdf_id
      const response = await queryPDF(pdfId, userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setChatSessions((prev) => {
        const newSessions = new Map(prev);
        const currentMessages = newSessions.get(pdfId) || [];
        newSessions.set(pdfId, [...currentMessages, aiMessage]);
        return newSessions;
      });
    } catch (error) {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (index: number) => {
    setActiveFile(index);
    const pdfId = uploadedFiles[index].id;
    const fileName = uploadedFiles[index].name;
    
    // Initialize chat session for new file if it doesn't exist
    if (!chatSessions.has(pdfId)) {
      setChatSessions((prev) => {
        const newSessions = new Map(prev);
        newSessions.set(pdfId, [{
          id: `welcome-${pdfId}`,
          content: `Hello! I'm ready to help you analyze "${fileName}". Ask me anything about this specific PDF document!`,
          role: "assistant" as const,
          timestamp: new Date(),
        }]);
        return newSessions;
      });
    }
    
    toast({
      title: "PDF Selected",
      description: `Now analyzing: ${fileName}`,
    });
  };

  const handleFileRemove = (index: number) => {
    const fileToRemove = uploadedFiles[index].id;
    
    // Remove the chat session for this file
    setChatSessions((prev) => {
      const newSessions = new Map(prev);
      newSessions.delete(fileToRemove);
      return newSessions;
    });
    
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFile === index) {
      setActiveFile(uploadedFiles.length > 1 ? 0 : null);
    }
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    
    if (files.length > 0) {
      try {
        // Upload files to backend and get pdf_ids
        const uploadPromises = files.map(async (file) => {
          const response = await uploadPDF(file);
          return {
            id: response.pdf_id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
        });

        const newFiles = await Promise.all(uploadPromises);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        
        // If no file is active, select the first new file
        if (activeFile === null) {
          setActiveFile(uploadedFiles.length);
          const pdfId = newFiles[0].id;
          const fileName = newFiles[0].name;
          setChatSessions((prev) => {
            const newSessions = new Map(prev);
            newSessions.set(pdfId, [{
              id: `welcome-${pdfId}`,
              content: `Hello! I'm ready to help you analyze "${fileName}". Ask me anything about this specific PDF document!`,
              role: "assistant" as const,
              timestamp: new Date(),
            }]);
            return newSessions;
          });
        }
        
        toast({
          title: "Files Added",
          description: `Added ${files.length} PDF${files.length > 1 ? "s" : ""}`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload PDFs",
          variant: "destructive",
        });
      }
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
        <header className="h-16 border-b border-border flex items-center bg-card/50 backdrop-blur-sm">
          {/* Desktop sidebar toggle - aligned with sidebar edge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex ml-2 mr-3"
          >
            <Menu size={20} />
          </Button>
          
          {/* Main header content */}
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
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
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {activeFile === null ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg font-medium mb-2">No PDF Selected</p>
                <p className="text-sm">Upload and select a PDF to start chatting</p>
              </div>
            ) : getCurrentMessages().length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">Start a conversation about {uploadedFiles[activeFile].name}</p>
              </div>
            ) : (
              getCurrentMessages().map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {isLoading && activeFile !== null && (
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