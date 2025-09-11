import { FileText } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-xl" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-md opacity-70 animate-pulse-glow" />
        <div className="relative bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
          <FileText size={sizes[size].icon} className="text-primary-foreground" />
        </div>
      </div>
      <span className={`font-bold ${sizes[size].text} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
        DocuMate
      </span>
    </div>
  );
};

export default Logo;