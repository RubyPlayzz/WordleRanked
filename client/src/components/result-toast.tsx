import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ResultToastProps {
  message: string;
  visible: boolean;
}

export function ResultToast({ message, visible }: ResultToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Hide toast after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  return (
    <div 
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 z-50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <p className="text-center font-bold">{message}</p>
    </div>
  );
}
