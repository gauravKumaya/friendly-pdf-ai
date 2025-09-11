import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User size={18} className="text-primary-foreground" />
        ) : (
          <Bot size={18} className="text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[70%] px-4 py-3 rounded-2xl",
          isUser
            ? "chat-bubble-user rounded-tr-sm"
            : "chat-bubble-ai rounded-tl-sm"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;