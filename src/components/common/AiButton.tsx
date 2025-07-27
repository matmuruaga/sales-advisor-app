import { Button, ButtonProps } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const AiButton = ({ children, ...props }: AiButtonProps) => {
  return (
    <div className="rounded-md bg-gradient-to-br from-purple-400 to-pink-500 p-px shadow-sm hover:shadow-md transition-shadow">
      <Button
        variant="outline"
        className="w-full h-full bg-white/80 backdrop-blur-sm text-xxs"
        {...props}
      >
        <Sparkles className="w-3 h-3 mr-1.5 text-purple-500" />
        {children}
      </Button>
    </div>
  );
};